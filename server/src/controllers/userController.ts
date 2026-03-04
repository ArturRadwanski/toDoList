import { Request, Response, NextFunction } from 'express';
import { DatabaseSync, SQLOutputValue} from 'node:sqlite';
import bcrypt from 'bcrypt';
import { resolveObjectURL } from 'node:buffer';

export async function addNewUser(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {    
    try {
    const salt = await bcrypt.genSalt(10);
    const password:string = req.body.password;
    const hash:string = await bcrypt.hash(password, salt);
    
    const nickname = req.body.nickname
    const querry = database.prepare(`INSERT INTO users (nickname, hash)
         VALUES(?, ?)`);
    const _ = querry.run(nickname, hash);
    res.sendStatus(201);
    }
    catch(error:any) {
        if (error.code == 'ERR_SQLITE_ERROR' && error.errstr == 'constraint failed'){
            res.statusMessage = "This nickname is already taken!"
            res.statusCode = 409;
            return res.send();
        }
        res.sendStatus(500);
        
    }
    
}

export async function logIn(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    try {
        const nickname = req.body.nickname;
        const password = req.body.password;

        const querry = database.prepare("SELECT id, hash FROM users WHERE nickname = ?");
        const data = querry.all(nickname)[0];
        if (data === undefined) {
            res.statusMessage = "User with this nickname doesn't exists"
            res.statusCode = 404;
            return res.send();
        }

        const isOk = bcrypt.compare(password, data["hash"] as string);
        //ToDo handle wrong password
        
    }
    catch(error:any){
        console.log(error)
        res.sendStatus(500);
    }
}