import { Request, Response, NextFunction } from 'express';
import { DatabaseSync} from 'node:sqlite';

//In this controller req.session.userId will always exist because of authenticator middleware connected in the router

/*
req.body : {
    name:string
}
*/
export async function addTag(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    if(req.body.name === undefined){
        res.statusCode=400;
        res.statusMessage="Incorrect request body";
        return res.send();
    }
    const name = String(req.body.name);
    const user_id = req.session.userId!;
    try{
        const querry = database.prepare("INSERT INTO tags (user_id, name) VALUES (?, ?)");
        querry.run(user_id, name);
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
    const querry = database.prepare("INSERT INTO tasks (name, description, requiredBy, priority, user_id) VALUES (?, ?, ?, ?, ?)");
    querry.run(name, description, requiredBy, Math.floor(priority) % 3, user_id);
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
        }
        return res.sendStatus(500);
    }
}