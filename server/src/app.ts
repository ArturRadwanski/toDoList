import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { handler } from '../../client/build/handler.js';
import {DatabaseSync} from 'node:sqlite'
import userRouter from "./routes/userRouter.js"

const database = new DatabaseSync('./database.db')
    database.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL,
        email TEXT
        );`)
database.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    required_by TEXT NOT NULL,
    ended TEXT,
    priority INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
    );`)
const app = express();
app.use(express.json());

// Routes
app.use("/user", userRouter(database))


//app.use(errorHandler);
//svelte app
app.use(handler)


export default app;