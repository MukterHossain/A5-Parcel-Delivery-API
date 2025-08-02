/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelService } from "./parcel.service";
import AppError from "../../errorHandler/AppError";
import { Parcel } from "./parcel.model";
import { IUser } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";
import { PARCEL_STATUS } from "./parcel.interface";




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
const getParcelStatusLog = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{

   // const senderId = req.user?.userId
    const {id: parcelId} = req.params

    // if(!sender){
    //     throw new AppError(401, "You are not authorized")
    // }
    
    const result = await ParcelService.getParcelStatusLog(parcelId)
    console.log("Parcel Status log", result)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Parcel status logs retrived successfully",
        data: result
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
const getIncomingParcels = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
const parcels = await Parcel.find().limit(1)
    console.log("Sample parcel", parcels)

    // const receiverId = req.user?.userId
    const receiverId = req.user as JwtPayload
    if(!receiverId){
        throw new AppError(401, "You are not authorized")
    }
       
    const result = await ParcelService.getIncomingParcels(receiverId.userId)
    console.log("result", result)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Incoming parcels retrived successfully",
        data: result.data,
        meta: result.meta
    })
})
const getDeliveryHistory = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    // const receiverId = req.user?.userId
    const receiverId = req.user as JwtPayload
    console.log("Sample receiverId", receiverId)
    if(!receiverId){
        throw new AppError(401, "Unauthorized: Receiver ID not found")
    }
       
    const result = await ParcelService.getDeliveryHistory(receiverId.userId)
    console.log("result", result)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Incoming parcels retrived successfully",
        data: result.data,
        meta: result.meta
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
const blockParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    const {id} = req.params
    const admin = req.user as JwtPayload
    const adminId = admin.userId
       
    const result = await ParcelService.blockParcel(id,  adminId as string)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: `Parcel ${result.isBlocked ? PARCEL_STATUS.BLOCKED : PARCEL_STATUS.UNBLOCKED}`,
        data: result
    })
})
const getTrackingParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{
    
    const {trackingId} = req.params
       
    const result = await ParcelService.getTrackingParcel(trackingId)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: `Parcel tracking data retrieved successfully`,
        data: result
    })
})



export const ParcelController = {
    createParcel,
    getAllParcel,
    getIncomingParcels,
    getParcelStatusLog,
    cancelParcel,
    getDeliveryHistory,
    confirmDelivery,
    getAllParcels,
    updateParcelStatus,
    blockParcel,
    getTrackingParcel
}