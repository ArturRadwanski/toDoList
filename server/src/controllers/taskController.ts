import { Request, Response, NextFunction } from 'express';
import { DatabaseSync} from 'node:sqlite';

//In this controller req.session.userId will always exist because of authenticator middleware connected in the router


/*
req.body: {
    name: string,
    priority: number,
    tags: number[], //we get them by id
    description: string,
    requiredBy: string, //unix timestamp

}

returns taskId
*/
export async function addTask(req:Request, res:Response, next:NextFunction, database:DatabaseSync){
    const user_id = req.session.userId!;
    const name:string | undefined = req.body.name;
    const priority:number | undefined = req.body.priority;
    const tags: number[] | undefined = req.body.tags;
    const description:string | undefined = req.body.description;
    const requiredBy:number | undefined = req.body.requiredBy;

    if (name === undefined || priority === undefined || tags === undefined || description === undefined || requiredBy === undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect request body";
        return res.send();
    }
    try{
    database.exec("BEGIN TRANSACTION");
    const querry = database.prepare("INSERT INTO tasks (name, description, required_by, priority, user_id, ended) VALUES (?, ?, ?, ?, ?, 0)");
    const result = querry.run(name, description, requiredBy, priority, user_id);
    const taskId = result.lastInsertRowid;


    const relation_querry = database.prepare("INSERT INTO task_tags (task_id, tag_id) VALUES (?,?)")
    tags.forEach((tag_id) => {
        relation_querry.run(taskId, tag_id);
    })
    database.exec("COMMIT");
    res.statusCode = 201;
    res.statusMessage = "Succesfully created task";
    return res.json({taskId});

    
    }
    catch(err:any){
        console.log(err);
        try{
            database.exec("ROLLBACK");
        }
        catch{
            res.statusCode = 503;
            res.statusMessage = "Database is down";
            res.send();
        }
        if(err.code == 'ERR_SQLITE_ERROR' && err.errstr == 'constraint failed'){
            console.log(err.message);
            if(err.message == "FOREIGN KEY constraint failed"){
                res.statusCode = 404;
                res.statusMessage = "Could not find user with this id";
                return res.send();
            }
        }
        return res.sendStatus(500);
    }
}

export async function getTasks(req:Request, res:Response, next:NextFunction, database:DatabaseSync){
    const user_id = req.session.userId!;
    const querry = database.prepare(`SELECT
            t.id, 
            t.name,
            t.description,
            t.ended,
            t.required_by,
            t.priority,
            GROUP_CONCAT(tg.id) AS task_tags
        FROM tasks AS t
        LEFT JOIN task_tags AS t_tg ON t.id = t_tg.task_id
        LEFT JOIN tags AS tg on t_tg.tag_id = tg.id
        WHERE t.user_id = ?
        GROUP BY t.id`);
    const result = querry.all(user_id);

    const tasks = result.map(element => {
        return {
            id: element.id,
            name: element.name,
            description: element.description,
            ended: element.ended,
            requiredBy: element.required_by,
            priority: element.priority,
            tags: element.task_tags ? (element.task_tags as string).split(',').map(Number) : [],
        }
    })
    return res.json(tasks);

}




/*
req.body: {
taskId: number
}


*/
export async function deleteTask(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    const userId = req.session.userId!;
    const taskId = req.body.taskId;
    if (taskId === undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect request body";
        return res.send();
    }

    const querry = database.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    const result = querry.run(taskId, userId);

    if(result.changes === 0){
        res.statusCode = 404;
        res.statusMessage = "User does not have task with requested id";
        return res.send();
    }

    res.statusCode = 200;
    res.statusMessage = "Task deleted";
    return res.send();
}

/*
req.body: {
    taskId: number,
    name: string,
    description: string,
    requiredBy: number,
    priority: number,
    newTags: number[],
    removedTags:number[]
}
*/

export async function editTask(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    const userId = req.session.userId!;

    const taskId = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const requiredBy = req.body.requiredBy;
    const priority = req.body.priority;
    const newTags = req.body.newTags;
    const removedTags = req.body.removedTags;

    console.log(req.body);

    if(
        taskId === undefined || name === undefined || description === undefined || 
        requiredBy === undefined || priority === undefined || newTags === undefined ||
        removedTags === undefined
    ) {
        res.statusCode = 400;
        res.statusMessage = "Incorrect request body"
        return res.send();       
    }
    try {
        database.exec("BEGIN TRANSACTION");
        const querry = database.prepare(`UPDATE tasks SET name = ?, description = ?, 
            required_by = ?, priority = ? WHERE id = ? AND user_id = ?`);
        const result = querry.run(name, description, requiredBy, priority, taskId, userId);

        if(result.changes === 0){
            database.exec("ROLLBACK");
            res.statusCode = 404;
            res.statusMessage = "User does not have task with requested id";
            return res.send();
        }

        const addTagQuerry = database.prepare("INSERT INTO task_tags (tag_id, task_id) VALUES (?, ?)");
        (newTags as number[]).forEach(tag => addTagQuerry.run(tag, taskId));

        const removeTagQuerry = database.prepare("DELETE FROM task_tags WHERE tag_id = ? AND task_id = ?");
        (removedTags as number[]).forEach(tag => removeTagQuerry.run(tag, taskId));

        database.exec("COMMIT");

        res.statusCode = 200;
        res.statusMessage = "Task edited";
        return res.send();

    } catch (err:any) {
        console.log(err);
        try {
            database.exec("ROLLBACK");
        }
        catch (err:any) {
            res.statusCode = 503;
            res.statusMessage = "Database is down";
            res.send();
        }
        if(err.code == 'ERR_SQLITE_ERROR' && err.errstr == 'constraint failed'){
            console.log(err.message);
            if(err.message == "FOREIGN KEY constraint failed"){
                res.statusCode = 400;
                res.statusMessage = "Operation did not complete";
                return res.send();
            }
        }
        return res.sendStatus(500);
    }


}