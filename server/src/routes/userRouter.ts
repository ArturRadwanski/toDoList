import {Router, Request, Response, NextFunction} from 'express';
import { DatabaseSync } from 'node:sqlite';
import {addNewUser} from '../controllers/userController.js';
import {check} from 'express-validator';

export default function userRouter(database:DatabaseSync){
    const router = Router();
    router.post("/", [check('nickname')], (req:Request, res:Response, next:NextFunction) => addNewUser(req, res, next, database))
    return router;
}