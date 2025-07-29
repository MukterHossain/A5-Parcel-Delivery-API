/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { UserService } from "./user.service";


const createUser = catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const user = await UserService.createUser(req.body)

    sendResponse(res, {
        success:true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})




export const UserController = {
    createUser
}