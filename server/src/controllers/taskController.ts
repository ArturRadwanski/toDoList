import { Request, Response, NextFunction } from 'express';
import { DatabaseSync} from 'node:sqlite';

//In this controller req.session.userId will always exist because of authenticator middleware connected in the router

/*
req.body : {
    name:string,
    color: {hue:number, saturation:number, lightness: number}
}
*/
export async function addTag(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    if(req.body.name === undefined || req.body.color === undefined){
        res.statusCode=400;
        res.statusMessage="Incorrect request body";
        return res.send();
    }
    const name = String(req.body.name).trim();
    const color: {hue:number, saturation:number, lightness: number} = req.body.color;
    if(color.hue === undefined || color.saturation === undefined || color.lightness === undefined){
        res.statusCode=400;
        res.statusMessage="Incorrect request body";
        return res.send();
    }
    const user_id = req.session.userId!;
    const name_regex = /^[a-zA-Z0-9 ]*$/ //allow only letter,numbers and blank space
    if(!name_regex.test(name)){
        res.statusCode=400;
        res.statusMessage = "Incorrect name for a tag! Use only letter/numbers/blankspace"
        return res.send();
    }
    try{
        const querry = database.prepare("INSERT INTO tags (user_id, name, hue, saturation, lightness) VALUES (?, ?, ?, ?, ?)");
        querry.run(user_id, name, color.hue, color.saturation, color.lightness);
        return res.sendStatus(201);
    }
    catch(err:any){
        console.log(err);
        if(err.code == 'ERR_SQLITE_ERROR' && err.errstr == 'constraint failed'){
            console.log(err.message);
            if(err.message == "FOREIGN KEY constraint failed"){
                res.statusCode = 404;
                res.statusMessage = "Could not find user with this id";
                return res.send();
            }
            if(err.message == "UNIQUE constraint failed: tags.user_id, tags.name"){
                res.statusCode = 400;
                res.statusMessage = "You already have a tag with this name!"
                return res.send();
            }
            

        }
        return res.sendStatus(500);
    }
}

/*
req.body: {
    name: string,
    priority: number,
    tags: number[], //we get them by id
    description: string,
    requiredBy: string, //unix timestamp

}
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
    const querry = database.prepare("INSERT INTO tasks (name, description, required_by, priority, user_id) VALUES (?, ?, ?, ?, ?)");
    const result = querry.run(name, description, requiredBy, Math.floor(priority) % 3, user_id);

    const relation_querry = database.prepare("INSERT INTO task_tags (task_id, tag_id) VALUES (?,?)")
    tags.forEach((tag_id) => {
        relation_querry.run(result.lastInsertRowid, tag_id);
    })
    database.exec("COMMIT");
    res.statusCode = 201;
    res.statusMessage = "Succesfully created task";
    return res.send();

    
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
        JOIN task_tags AS t_tg ON t.id = t_tg.task_id
        JOIN tags AS tg on t_tg.tag_id = tg.id
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

export async function getTags(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    const user_id = req.session.userId!;
    
    const querry = database.prepare("SELECT * FROM tags WHERE user_id = ?")
    const result = querry.all(user_id);
    res.json(result);
}