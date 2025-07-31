/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParcelService } from "./parcel.service";
import AppError from "../../errorHandler/AppError";
import { Parcel } from "./parcel.model";




const createParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{

    const senderId = req.user?.userId
    if(!senderId){
        throw new AppError(401, "You are not authorized")
    }
    const result = await ParcelService.createParcel(req.body, senderId)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Parcel created successfully",
        data: result
    })
})
const getAllParcel = catchAsync(async(req:Request, res: Response, next: NextFunction) =>{

    const senderId = req.user?.userId
    if(!senderId){
        throw new AppError(401, "You are not authorized")
    }
    
    // console.log("totalParcel", totalParcel)
    const result = await ParcelService.getAllParcel(senderId)

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
    const receiverId = req.user?.userId
    if(!receiverId){
        throw new AppError(401, "You are not authorized")
    }
       
    const result = await ParcelService.getAllParcel(receiverId)
    console.log("result", result)

    sendResponse(res, {
        success:true,
        statusCode: 200,
        message: "Incoming parcels retrived successfully",
        data: result.data,
        meta: result.meta
    })
})



export const ParcelController = {
    createParcel,
    getAllParcel,
    getIncomingParcels
}