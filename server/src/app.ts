import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { handler } from '../../client/build/handler.js';
import {DatabaseSync} from 'node:sqlite'
import userRouter from "./routes/userRouter.js"
import config from './config/config.js';
import sqlite3Store from 'connect-sqlite3';
import databaseInit from './databaseInit.js';
import taskRouter from './routes/taskRouter.js';
import cors from "cors";
import tagRouter from './routes/tagRoutes.js';


const database = new DatabaseSync('./database.db')
databaseInit(database);


const app = express();
app.use(express.json());
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
    origin: isProd ? false : 'http://localhost:5173', 
    credentials: true
}));



const SQLiteStore = sqlite3Store(session);
app.use(session({
    store: new SQLiteStore({
        db: 'database.db',    
        dir: './',            
        table: 'sessions'     
    }) as unknown as any,
    secret: config.jwtSecretKey,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 30, // session ends after 30 minutes of inactivity
        httpOnly: true,
    }
}))
app.use(cookieParser());

// Routes
app.use("/user", userRouter(database));
app.use("/task", taskRouter(database));
app.use("/tag", tagRouter(database));
app.use(handler)




export default app;