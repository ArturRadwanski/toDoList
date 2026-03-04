import { Request, Response, NextFunction } from 'express';
import { DatabaseSync} from 'node:sqlite';
import bcrypt from 'bcrypt';

export async function addNewUser(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {    
    try {
    const salt = await bcrypt.genSalt(10);
    const password:string = req.body.password;
    const hash:string = await bcrypt.hash(password, salt);
    
    const nickname = req.body.nickname
    const querry = database.prepare(`INSERT INTO users (nickname, hash)
         VALUES(?, ?)`);
    const _ = querry.run(nickname, hash);
    res.sendStatus(200);
    }
    catch(error:any) {
        if (error.code == 'ERR_SQLITE_ERROR' && error.errstr == 'constraint failed'){
            res.statusMessage = "This nickname is already taken!"
            res.sendStatus(409);
        }
        res.sendStatus(500);
        
    }
    
    //toDo obsluga takich samych nicknameów
}