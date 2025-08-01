/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelService } from "./parcel.service";
import AppError from "../../errorHandler/AppError";
import { Parcel } from "./parcel.model";
import { IUser } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";




const createParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{

    const sender = req.user as JwtPayload
    if(!sender){
        throw new AppError(401, "You are not authorized")
    }
    const result = await ParcelService.createParcel(req.body, sender.userId)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Parcel created successfully",
        data: result
    })
})
const getAllParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{

    // const senderId = req.user?.userId
    const sender = req.user as JwtPayload

    if(!sender){
        throw new AppError(401, "You are not authorized")
    }
    
    // console.log("totalParcel", totalParcel)
    const result = await ParcelService.getAllParcel(sender.userId)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "All parcel retrived successfully",
        data: result.data,
        meta: result.meta
    })
})
const getIncomingParcels = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
const parcel = await Parcel.find().limit(1)
    console.log("Sample parcel", parcel)

    // const receiverId = req.user?.userId
    const receiver = req.user as JwtPayload
    if(!receiver){
        throw new AppError(401, "You are not authorized")
    }
       
    const result = await ParcelService.getAllParcel(receiver.userId)
    console.log("result", result)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Incoming parcels retrived successfully",
        data: result.data,
        meta: result.meta
    })
})
const cancelParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    const user = req.user as JwtPayload
    const parcelId = req.params.id
       
    const result = await ParcelService.cancelParcel(parcelId, user.userId)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Parcel cancel successfully",
        data: result
    })
})
const confirmDelivery = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    const user = req.user as JwtPayload
    console.log("Decoded user", user)
    const parcelId = req.params.id
       
    const result = await ParcelService.confirmDelivery(parcelId, user.userId)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Parcel delivery successfully",
        data: result
    })
})


const getAllParcels = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    const {status, sender, receiver} = req.query
    const filters = {
        status: status as string,
        sender: sender as string,
        receiver: receiver as string
    }
       
    const result = await ParcelService.getAllParcels(filters)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "All parcel retrived successfully",
        data: result
    })
})
const updateParcelStatus = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    const {id} = req.params
    const {status} = req.body
    const admin = req.user as JwtPayload
    const adminId = admin.userId
       
    const result = await ParcelService.updateParcelStatus(id, status, adminId as string)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: `Status updated to ${status}`,
        data: result
    })
})



export const ParcelController = {
    createParcel,
    getAllParcel,
    getIncomingParcels,
    cancelParcel,
    confirmDelivery,
    getAllParcels,
    updateParcelStatus
}