import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.statusCode = 401;
    res.statusMessage = "Session has ended";
    res.send();
};