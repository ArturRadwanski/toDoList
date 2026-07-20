import { DatabaseSync } from "node:sqlite";

export default function databaseInit(database:DatabaseSync){
    database.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        active INTEGER NOT NULL
        );`)

    database.exec(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        required_by INTEGER NOT NULL,
        ended INTEGER,
        priority INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
        );`)

    database.exec(`CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        hue INTEGER NOT NULL CHECK(hue >= 0) CHECK(hue <= 359),
        saturation INTEGER NOT NULL CHECK(saturation >= 0) CHECK(saturation <= 100), 
        lightness INTEGER NOT NULL CHECK(lightness >= 0) CHECK(lightness <= 100),
        UNIQUE(user_id, name),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );`)

    database.exec(`CREATE TABLE IF NOT EXISTS task_tags (
        tag_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        PRIMARY KEY (task_id, tag_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );`)

}