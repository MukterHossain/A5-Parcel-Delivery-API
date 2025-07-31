/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
// import AppError from "../../errorHandler/AppError"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { AuthServices } from "./auth.service"
import httpStatus from "http-status-codes"


const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const loginInfo = await AuthServices.credentialsLogin(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Logged In Successfully",
        data: loginInfo
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    // res.clearCookie("refreshToken", {
    //     httpOnly: true,
    //     secure: false,
    //     sameSite: "lax"
    // })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Logged Out Successfully",
        data: null
    })
})



export const AuthControllers = {
    credentialsLogin,
    // getNewAccessToken,
    logout,
    // changePassword,
    // resetPassword,
    // setPassword,
    // forgotPassword,
    // googleCallbackController,
}