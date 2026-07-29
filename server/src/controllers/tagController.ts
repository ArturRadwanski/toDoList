import { Request, Response, NextFunction } from "express";
import { DatabaseSync } from "node:sqlite";

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

export async function getTags(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    const user_id = req.session.userId!;
    
    const querry = database.prepare("SELECT * FROM tags WHERE user_id = ?")
    const result = querry.all(user_id);
    res.json(result);
}