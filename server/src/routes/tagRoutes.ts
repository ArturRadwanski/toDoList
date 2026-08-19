import { Router } from "express";
import { DatabaseSync } from "node:sqlite";
import { isAuthenticated } from "../middleware/authenticator.js";
import { addTag, getTags, removeTag } from "../controllers/tagController.js";

export default function tagRouter(database:DatabaseSync){
    const router = Router();
    router.post("/", isAuthenticated, (req, res, next) => addTag(req, res, next, database));
    router.get("/", isAuthenticated, (req, res, next) => getTags(req, res, next, database));
    router.delete("/:id", isAuthenticated, (req, res, next) => removeTag(req, res, next, database))
    return router;
}