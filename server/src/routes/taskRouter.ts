import {Router, Request, Response, NextFunction} from 'express';
import { DatabaseSync } from 'node:sqlite';
import { isAuthenticated } from '../middleware/authenticator.js';
import { addTag, addTask, getTags, getTasks } from '../controllers/taskController.js';

export default function taskRouter(database:DatabaseSync){
    const router = Router();
    router.get("/", isAuthenticated, (req:Request, res:Response, next:NextFunction) => getTasks(req, res, next, database));
    router.get("/tag", isAuthenticated, (req,res,next) => getTags(req, res, next, database));
    router.post("/tag", isAuthenticated, (req:Request, res:Response, next:NextFunction) => addTag(req, res, next,database));
    router.post("/", isAuthenticated, (req, res, next) => addTask(req, res, next, database));
    return router;
}