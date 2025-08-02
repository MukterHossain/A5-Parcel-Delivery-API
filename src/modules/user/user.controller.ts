/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userPayload = req.body
    const user = await UserService.createUser(userPayload)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})


const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id
    const verifiedToken = req.user;
    const payload = req.body
    const user = await UserService.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user
    })
})


const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.getAllUsers()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Users Retrived Successfully",
        data: result.data,
        meta: result.meta
    })
})
const blockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const result = await UserService.blockUser(id)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User blocked Successfully",
        data: result
    })
})
const unblockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const result = await UserService.unblockUser(id)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User unblocked or actived Successfully",
        data: result
    })
})
const updateUserRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { _id: adminId } = req.user as JwtPayload
    const userId = req.params.id
    const { role } = req.body
    const result = await UserService.updateUserRole(adminId, userId, role)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User role updated Successfully",
        data: result
    })
})




export const UserController = {
    createUser,
    getAllUsers,
    updateUser,
    blockUser,
    unblockUser,
    updateUserRole
}