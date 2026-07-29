import {Router, Request, Response, NextFunction} from 'express';
import { DatabaseSync } from 'node:sqlite';
import { isAuthenticated } from '../middleware/authenticator.js';
import { addTask, deleteTask, editTask, getTasks } from '../controllers/taskController.js';

export default function taskRouter(database:DatabaseSync){
    const router = Router();
    router.get("/", isAuthenticated, (req, res, next) => getTasks(req, res, next, database));
    router.post("/", isAuthenticated, (req, res, next) => addTask(req, res, next, database));
    router.delete("/", isAuthenticated, (req, res, next) => deleteTask(req, res, next, database));
    router.put("/", isAuthenticated, (req, res, next) => editTask(req, res, next, database));
    return router;
}