import {Router, Request, Response, NextFunction} from 'express';
import { DatabaseSync } from 'node:sqlite';
import { isAuthenticated } from '../middleware/authenticator.js';
import { addTag } from '../controllers/taskController.js';

export default function taskRouter(database:DatabaseSync){
    const router = Router();
    router.get("/", isAuthenticated, (req:Request, res:Response, next:NextFunction) => {});
    router.post("/tag", isAuthenticated, (req:Request, res:Response, next:NextFunction) => addTag(req, res, next,database));
    return router;
}