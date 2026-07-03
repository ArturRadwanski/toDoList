import { Request, Response, NextFunction } from 'express';
import { DatabaseSync, SQLOutputValue} from 'node:sqlite';
import bcrypt from 'bcrypt';
import config from '../config/config.js'
import jwt from 'jsonwebtoken'

/*
req body: {
    nickname:string,
    password: string,
    email: string
}

possible responses:
400 Request body is incorrect
409 This nickname is already taken
201
*/
export async function addNewUser(req:Request, res:Response, next:NextFunction, database:DatabaseSync) {    
    try {
    const salt = await bcrypt.genSalt(10);
    const password:string = req.body.password;
    const nickname:string = req.body.nickname;
    const email_raw:string = req.body.email;

    if (password === undefined || nickname === undefined || email_raw === undefined){
        res.statusCode = 400;
        res.statusMessage = "Request body is incorrect";
        return res.send();
    }
    const email = email_raw.toLowerCase();
    const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm


    if(!emailRegex.test(email)){
        res.statusCode = 400;
        res.statusMessage = "This is not a valid email"
        return res.send();
    }

    const hash:string = await bcrypt.hash(password + config.pepper, salt);

    
    const email_salt = config.emailSecretKey;
    const emailVerfier:string = jwt.sign({nickname, email}, email_salt, {expiresIn: "5m"})

    console.log(emailVerfier);

    // ToDo, actual sending emails, do not waste free plan during development
    const querry = database.prepare(`INSERT INTO users (nickname, hash, email, active)
         VALUES(?, ?, ?, 0)`);
    querry.run(nickname, hash, email);

    res.sendStatus(201);
    }
    catch(error:any) {
        if (error.code == 'ERR_SQLITE_ERROR' && error.errstr == 'constraint failed'){
            if(error.message == "UNIQUE constraint failed: users.email"){
                res.statusMessage = "This email is already taken!"
                res.statusCode = 409;
                return res.send();
            }

            if(error.message == "UNIQUE constraint failed: users.nickname"){
                res.statusMessage = "This nickname is already taken!"
                res.statusCode = 409;
                return res.send();
            }
            
        }
        console.log(error);
        
        return res.sendStatus(500);
        
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
            return res.send({authToken, refreshToken});
            
        }
        else {
            res.statusMessage = "Password is incorrect";
            res.statusCode = 409;
            return res.send();
        }
        
        
    }
    catch(error:any){
        console.log(error)
        return res.sendStatus(500);
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
        return res.sendStatus(500);
    }
    
}

/*
req body:{
    authToken: string,
    password: string
}

possible responses:
400 Request body is incorrect
401 Token has expired | Password is incorrect
200 body: {newAuthToken: string, newRefreshToken: string}
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
            return res.send();
        }
        else {
            res.statusCode = 401;
            res.statusMessage = "Password is incorrect";
            return res.send();
        }

    } 
    catch(error:any){
        if (error instanceof jwt.TokenExpiredError){
            res.statusCode = 401;
            res.statusMessage = "Token has expired";
            return res.send();
        }
        console.log(error);
        return res.send(500);
    }
}

/*req params: {
    emailKey:string 
}
possible responses:
400 Request parameters are incorrect | This token has expired | This token is not valid
200


*/
export async function verifyEmail(req:Request, res:Response, next: NextFunction, database: DatabaseSync) {
    const emailKey = req.params.emailKey;
    if(emailKey === undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect parameters in url"
        return res.send();
    }
    try{
    const payload = jwt.verify(emailKey[0] as string, config.emailSecretKey)
    if (typeof payload == 'string'){
        res.statusCode = 400;
        res.statusMessage = "Incorrect parameters in url"
        return res.send();
    }
    const nickname = payload.nickname;
    if(nickname === undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect parameters in url"
        return res.send();
    }
    
    const querry = database.prepare("UPDATE users SET active = 1 WHERE nickname = ?")
    querry.run(nickname);

    res.statusCode = 200;
    return res.send();
}
catch(error:any){
    if(error.name == 'TokenExpiredError'){
        res.statusCode = 400;
        res.statusMessage = "This token has expired";
        return res.send();
    }
    else if (error.name = 'JsonWebTokenError'){
        res.statusCode = 400;
        res.statusMessage = "This token is invalid";
        return res.send();
    }
}
}


export async function askPasswordReset(req: Request, res: Response, next: NextFunction, database: DatabaseSync) {
    const nickname = req.body.nickname;
    if(nickname === undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect request body.";
        return res.send();
    }
    const querry = database.prepare("SELECT email, active FROM users WHERE nickname = ?")
    const result = querry.get(nickname);
    if(result == undefined){
        res.statusCode = 404;
        res.statusMessage = "User with this nickname does not exist.";
        return res.send();
    }
    const active = result.active!;
    const email = result.email!;

    if(active == 0){
        res.statusCode = 400;
        res.statusMessage = "You have not activated your email, so you cannot reset your password.";
        return res.send();
    }
    const passwordCode = jwt.sign({nickname}, config.emailSecretKey, {expiresIn: "5m"});

    console.log(passwordCode)
    //ToDo actual email sending, do not waste recources while developing
    res.statusCode = 200;
    return res.send();
}

export async function passwordReset(req: Request, res: Response, next: NextFunction, database: DatabaseSync) {
    const token = req.body.token;
    const password = req.body.password;
    if(token === undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect parameters in url"
        return res.send();
    }
    try{
    const payload = jwt.verify(token[0] as string, config.emailSecretKey)
    if (typeof payload == 'string'){
        res.statusCode = 400;
        res.statusMessage = "Incorrect parameters in url"
        return res.send();
    }
    const nickname = payload.nickname;
   
    if(nickname === undefined || password == undefined){
        res.statusCode = 400;
        res.statusMessage = "Incorrect parameters in url"
        return res.send();
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password + config.pepper, salt);

    const querry = database.prepare("UPDATE users SET hash = ? WHERE nickname = ?")
    querry.run(hash, nickname);

    res.statusCode = 200;
    return res.send();
}
catch(error:any){
    if(error.name == 'TokenExpiredError'){
        res.statusCode = 400;
        res.statusMessage = "This token has expired";
        return res.send();
    }
    else if (error.name = 'JsonWebTokenError'){
        res.statusCode = 400;
        res.statusMessage = "This token is invalid";
        return res.send();
    }
    res.statusCode = 500;
    return res.send();
}
}
