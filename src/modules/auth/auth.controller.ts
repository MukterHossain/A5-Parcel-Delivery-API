/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
// import AppError from "../../errorHandler/AppError"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { AuthServices } from "./auth.service"
import httpStatus from "http-status-codes"
import AppError from "../../errorHandler/AppError"
import { setAuthCookie } from "../../utils/setCookies"
import { JwtPayload } from "jsonwebtoken"
import { envVars } from "../../config/env"
import { createUserToken } from "../../utils/userTokens"
import passport from "passport"


const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async(err:any, user:any, info:any)=>{

        if(err){ 
            return next(new AppError(err.statusCode|| 401, err.message))
        }
        if(!user){
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserToken(user)

        // delete user.toObject().password
        const {password:pass, ...rest} = user.toObject()
        setAuthCookie(res, userTokens)
        sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Logged In Successfully",
        data: {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            user:rest
        }
       
    })
    })(req, res, next)
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)


    setAuthCookie(res, tokenInfo)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "New Access Token Retrived  Successfully",
        data: tokenInfo
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Logged Out Successfully",
        data: null
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user
    const newPassword = req.body.newPassword
    const oldPassword = req.body.oldPassword
    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload)
    // await AuthServices.resetPassword(req.body, decodedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null
    })
})

const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? req.query.state as string : ""
    if(redirectTo.startsWith("/")){
        redirectTo = redirectTo.slice(1)
    }
    const user = req.user;
    console.log("user", user)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
    const tokenInfo = createUserToken(user)
    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.CREATED,
    //     message: "Password Changed Successfully",
    //     data: null
    // })
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})



export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    // changePassword,
    resetPassword,
    // setPassword,
    // forgotPassword,
    googleCallbackController,
}