import { Request, Response, NextFunction } from 'express';
import { DatabaseSync} from 'node:sqlite';
import bcrypt from 'bcrypt';

export async function addNewUser(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {    
    const salt = await bcrypt.genSalt(10);
    const password:string = req.body.password;
    const hash:string = await bcrypt.hash(password, salt);
    
    const nickname = req.body.nickname
    const querry = database.prepare(`INSERT INTO users (nickname, hash)
         VALUES(?, ?)`)
    const changes = querry.run(nickname, hash)
    console.log(changes)
    res.sendStatus(200);
    
    //toDo obsluga takich samych nicknameów
}