import { JWT_SECRET } from "@repo/backend-common/config";
import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
export const middleware = (req: Request, res: Response, next: NextFunction) => {
    const token  = req.headers['authorization']?? "";
    const decoded = jwt.verify(token,JWT_SECRET);
    if(decoded){
        //@ts-ignore :Todo: Fix this
        req.userId = decoded.userId;
        next();
    }else{
        res.status(403).json({
            message:"Unauthorized"
        })
    }
}