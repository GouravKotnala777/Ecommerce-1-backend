import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/utilities";
import User, { UserTypes } from "../models/userModel";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedUserRequest extends Request {
    user:UserTypes;
}

export const isUserAuthenticated = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const token = req.cookies?.userToken;

        if (!token) return next(new ErrorHandler("Token not found", 404));

        const verifyToken = jsonwebtoken.verify(token, "thisissecret") as JwtPayload;

        const loggedInUser = await User.findById(verifyToken.id);

        if (!loggedInUser) return next(new ErrorHandler("User not found from auth.js", 404));

        (req as AuthenticatedUserRequest).user = loggedInUser;
        
        next();
        
    } catch (error) {
        console.log(error);
        next(error);        
    }
}