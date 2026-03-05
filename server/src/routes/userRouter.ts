import {Router, Request, Response, NextFunction} from 'express';
import { DatabaseSync } from 'node:sqlite';
import {addNewUser, logIn, refresh, deleteAccount} from '../controllers/userController.js';
import {check} from 'express-validator';

export default function userRouter(database:DatabaseSync){
    const router = Router();
    router.post("/", [check('nickname').trim().escape()], (req:Request, res:Response, next:NextFunction) => addNewUser(req, res, next, database));
    router.post("/login", [check('nickname').trim().escape()], (req:Request, res:Response, next:NextFunction) => logIn(req, res, next, database));
    router.post("/refresh", (req, res, next) => refresh(req, res, next,database));
    router.delete("/", (req, res, next) => deleteAccount(req, res, next, database));
    return router;
}