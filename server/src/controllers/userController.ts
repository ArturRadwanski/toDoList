import { Request, Response, NextFunction } from 'express';
import { DatabaseSync, SQLOutputValue} from 'node:sqlite';
import bcrypt from 'bcrypt';
import config from '../config/config.js'
import jwt from 'jsonwebtoken'

/*
req body: {
    nickname:string,
    password: string
}

possible responses:
400 Request body is incorrect
409 This nickname is already taken
201
*/
export async function addNewUser(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {    
    try {
    const salt = await bcrypt.genSalt(10);
    const password = req.body.password;
    const nickname = req.body.nickname;

    if (password === undefined || nickname === undefined){
        res.statusCode = 400;
        res.statusMessage = "Request body is incorrect";
        return res.send();
    }
    const hash:string = await bcrypt.hash(password + config.pepper, salt);
    
    
    const querry = database.prepare(`INSERT INTO users (nickname, hash)
         VALUES(?, ?)`);
    querry.run(nickname, hash);
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

/*
req body: {
    nickname: string,
    password: string
    }

possible responses :
404 User with this nickname does not exists
409 Password is incorrect
200 body: {authToken:string, refreshToken:string}
*/
export async function logIn(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {
    try {
        const nickname = req.body.nickname;
        const password = req.body.password;

        const querry = database.prepare("SELECT id, hash FROM users WHERE nickname = ?");
        const data = querry.all(nickname)[0];
        if (data === undefined) {
            res.statusMessage = "User with this nickname does not exists";
            res.statusCode = 404;
            return res.send();
        }

        const isOk = await bcrypt.compare(password + config.pepper, data.hash as string);
        if(isOk){
            const jwtSecretKey = config.jwtSecretKey;
            const authToken = jwt.sign(
                {id:data.id as string},
                jwtSecretKey,
                {expiresIn: "30m"});
            const refreshToken = jwt.sign(
                {id:data.id as string},
                jwtSecretKey,
                {expiresIn: "32m"});
            res.statusCode = 200;
            res.send({authToken, refreshToken});
            
        }
        else {
            res.statusMessage = "Password is incorrect";
            res.statusCode = 409;
            res.send();
        }
        
        
    }
    catch(error:any){
        console.log(error)
        res.sendStatus(500);
    }
}

/*
req body: {refreshToken: string}

possible responses:
400 Request body is incorrect
401 Token has expired
200 body: {newAuthToken: string, newRefreshToken: string}
*/
export function refresh(req:Request, res:Response, next:NextFunction, database:DatabaseSync){
    const refreshToken:string = req.body.refreshToken;
    if (refreshToken === undefined){
        res.statusCode = 400;
        res.statusMessage = "Request body is incorrect"
        return res.send();
    }
    try {
        const tokenBody = jwt.verify(refreshToken, config.jwtSecretKey);

        if (typeof tokenBody === 'string'){
            res.statusCode = 400;
            res.statusMessage = "Request body is incorrect"
            return res.send();
        }

        const payload = {
            id: tokenBody.id as string
        }
        const newAuthToken = jwt.sign(payload, config.jwtSecretKey, {expiresIn: "30m"});
        const newRefreshToken = jwt.sign(payload, config.jwtSecretKey, {expiresIn: "32m"});

        res.statusCode = 200;
        res.send({newAuthToken, newRefreshToken});
    }
    catch(error:any){
        if (error instanceof jwt.TokenExpiredError){
            res.statusCode = 401;
            res.statusMessage = "Token has expired";
            return res.send();
        }
        else if(error instanceof jwt.JsonWebTokenError) {
            res.statusCode = 400;
            res.statusMessage = "Token is invalid";
            return res.send();
        }
        res.sendStatus(500);
    }
    
}

/*
req body:{
    authToken: string,
    password: string
}
*/
export async function deleteAccount(req:Request, res:Response, next:NextFunction, database:DatabaseSync){
    const password:string = req.body.password;
    const authToken:string = req.body.authToken;
    
    console.log(authToken)
    if (password === undefined || authToken === undefined){
        res.statusCode = 400;
        res.statusMessage = "Request body is incorrect";
        return res.send();
    }

    try{

        const tokenBody = jwt.verify(authToken, config.jwtSecretKey)
        if (typeof tokenBody === 'string'){
            res.statusCode = 400;
            res.statusMessage = "Request body is incorrect";
            return res.send();
        }

        const id:number = parseInt(tokenBody.id);
        console.log(tokenBody)
        const querry = database.prepare('SELECT hash FROM users WHERE id = ?')
        const data = querry.all(id)[0];

        if (data === undefined){
            res.statusCode = 409;
            res.statusMessage = "User with this id does not exists, relog than try aggain";
            return res.send()
        }

        const isOk = await bcrypt.compare(password + config.pepper, data.hash as string);

        if (isOk){
            const querryDeleteUser = database.prepare("DELETE FROM users WHERE id = ?");
            const querryDeleteTasks = database.prepare("DELETE FROM tasks WHERE user_id = ?");
            querryDeleteTasks.run(id);
            querryDeleteUser.run(id);
            res.statusCode = 200;
            res.statusMessage = "Succesfully deleted";
            res.send();
        }
        else {
            res.statusCode = 401;
            res.statusMessage = "Password is incorrect";
            res.send();
        }

    } 
    catch(error:any){
        if (error instanceof jwt.TokenExpiredError){
            res.statusCode = 401;
            res.statusMessage = "Token expired";
            return res.send();
        }
        console.log(error);
        res.send(500);
    }
}
//ToDo email and password reset