/* eslint-disable no-console */

import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { NextFunction, Request, Response } from "express";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes"
import { IsActive } from "../modules/user/user.interface";
import AppError from "../errorHandler/AppError";
import { verifyToken } from "../utils/jwt";


export const checkAuth = (...authRoles:string[]) =>  async (req:Request, res:Response, next:NextFunction)=>{
try {
    const accessToken = req.headers.authorization || req.cookies.accessToken;
    if(!accessToken){
        throw new AppError(403, "No Token Recieved")
    }
    const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload


    const isUserExist = await User.findOne({ email: verifiedToken.email })
    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
    }
    if (!isUserExist.isVarified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not deleted")
    }
    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    }

    if(!authRoles.includes(verifiedToken.role)){
        throw new AppError(403, "You are not permitted to view this route!!!")
    }
    req.user = verifiedToken
    next()
} catch (error) {
    console.log("verifie Error", error)
    next(error)
}
}