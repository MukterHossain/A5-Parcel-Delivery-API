/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from "mongoose";
import { getTrackingId } from "../../utils/getTrackingId";
import { IParcel, PARCEL_STATUS } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHandler/AppError";
import httpStatus from "http-status-codes"
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import {ObjectId} from "mongodb"



const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
    const parcelCount = await Parcel.countDocuments()
    const trackingId = getTrackingId(parcelCount + 1)



    const parcel = await Parcel.create({
        ...payload,
        sender: senderId,
        trackingId,
        status: PARCEL_STATUS.REQUESTED,
        statusLogs: [{
            status: PARCEL_STATUS.REQUESTED,
            location: payload.pickupAddress || "Unknown",
            note: "Parcel Request created",
            updatedBy: senderId
        }]
    })

    return parcel
}


const getAllParcel = async (senderId: string) => {
    
    const parcels = await Parcel.find({ sender: senderId }).sort({ createdAt: -1 })
    const totalParcel = await Parcel.countDocuments({ sender: senderId })
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    }
}
const getParcelStatusLog = async (parcelId: string) => {

    const parcel = await Parcel.findById(parcelId).select("statusLogs")
    if (!parcel) {
        throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
    }
    return parcel
}

const cancelParcel = async (parcelId: string, senderId: string) => {

    const parcel = await Parcel.findOne({ _id: parcelId, sender: senderId })
    if (!parcel) {
        throw new AppError(401, "Parcel not found or you are not authorized")
    }
    if (parcel.status !== PARCEL_STATUS.REQUESTED && parcel.status !== PARCEL_STATUS.APPROVED) {
        throw new AppError(401, "Cannot cancel dispatch parcel")
    }
    parcel.status = PARCEL_STATUS.CANCELED;
    parcel.statusLogs.push({
        status: PARCEL_STATUS.CANCELED,
        note: "Parcel canceled by sender",
        updatedBy: new Types.ObjectId(senderId)
    })
    await parcel.save()
    return parcel;

}

const getIncomingParcels = async (receiverId: string) => {

    const parcels = await Parcel.find({ receiver: new Types.ObjectId(receiverId), status: { $nin: [PARCEL_STATUS.CANCELED, PARCEL_STATUS.REQUESTED] } }).sort({ createdAt: -1 })

    const totalParcel = await Parcel.countDocuments({ receiver: receiverId, status: { $nin: [PARCEL_STATUS.CANCELED, PARCEL_STATUS.REQUESTED] } })
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    }
}
const getDeliveryHistory = async (receiverId: string) => {

    const parcels = await Parcel.find({ receiver: receiverId, status: PARCEL_STATUS.DELIVERED }).sort({ updateAt: -1 })
    const totalParcel = await Parcel.countDocuments({ receiver: receiverId, status: PARCEL_STATUS.DELIVERED })
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    }
}



const confirmDelivery = async (parcelId: string, receiverId: string) => {
    const parcel = await Parcel.findOne({ _id: parcelId, receiver: receiverId })
    if (!parcel) {
        throw new AppError(401, "Delivery parcel not found or you are not authorized")
    }
    if (parcel.status !== PARCEL_STATUS.IN_TRANSIT) {
        throw new AppError(401, "Parcel is not ready to be delivered")
    }
    parcel.status = PARCEL_STATUS.DELIVERED;
    parcel.statusLogs.push({
        status: PARCEL_STATUS.DELIVERED,
        note: "Parcel delivered by receiver",
        updatedBy: new Types.ObjectId(receiverId)
    })
    await parcel.save()
    return parcel;

}



// Admin
const getAllParcels = async (query:any) => {
    const filters: Record<string, any> = {};
    
    if(query.status){
        filters.status = query.status
    }
    if(query.type){
        filters.type = query.type
    }
    if(query.sender){
        filters.sender = query.sender
    }
    if(query.receiver){
        filters.receiver = query.receiver
    }
    if(query.isBlocked !== undefined){
        filters.isBlocked = query.isBlocked = "true"
    }

    if(query.searchTerm){
        const searchRegex = new RegExp(query.searchTerm, "i");
        filters.$or = [
            { trackingId: { $regex: searchRegex } },
            { pickupAddress: { $regex: searchRegex } },
            { deliveryAddress: { $regex: searchRegex } },
            { type: { $regex: searchRegex } },
        ]

    }
    const sort = query.sort || "-createdAt";
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page -1) * limit;
    
    const parcels = await Parcel.find(filters)
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort(sort).skip(skip).limit(limit)
    const totalParcel = await Parcel.countDocuments(filters)
    return {
        data: parcels,
        meta: {
            total: totalParcel,
            page,
            limit,
            totalPages: Math.ceil(totalParcel / limit)
        }
    }
}
const getAnalytics = async (query:any) => {
   
    const totalUsers = await User.countDocuments();
    const totalSenders = await User.countDocuments({role: "SENDER"});
    const totalReceivers = await User.countDocuments({role: "RECEIVER"});

    const totalParcel = await Parcel.countDocuments();
    
    
    
    const parcelsStatusCount = await Parcel.aggregate([
        {$group:{
            _id: {
                month: {$month: "$createdAt"},
                year: {$year: "$createdAt"},
                status: "$status"
            },
            count: {$sum:1}
        }},
        {$sort: {"_id.year": 1, "_id.month": 1}}
    ])
    return {
        totalUsers,
        totalSenders,
        totalReceivers,
        totalParcel,
        parcelsStatusCount
    }
}
const getSenderAnalytics = async (query:any, senderId:string) => {
    const totalPacelSent = await Parcel.countDocuments({sender: senderId});
    const deliveredParcels = await Parcel.countDocuments({sender:senderId, status: PARCEL_STATUS.DELIVERED});
    const intransitParcels = await Parcel.countDocuments({sender:senderId, status: PARCEL_STATUS.IN_TRANSIT});

    const canceledParcel = await Parcel.countDocuments({sender:senderId, status: PARCEL_STATUS.CANCELED});
    
    const monthlyPacelStats = await Parcel.aggregate([
        {$match: {sender: new mongoose.Types.ObjectId(senderId)}},
        {$group:{
            _id: {
                month: {$month: "$createdAt"},
                year: {$year: "$createdAt"},
            },
            count: {$sum:1}
        }},
        {$sort: {"_id.year": 1, "_id.month": 1}}
    ])
    return {
        totalPacelSent,
        deliveredParcels,
        intransitParcels,
        canceledParcel,
        monthlyPacelStats
    }
}
const getReceiverAnalytics = async (query:any, receiverId:string) => {
    // const objectId = new ObjectId(String(payload.userId));
    const totalPacelReceived = await Parcel.countDocuments({receiver: receiverId});
    const deliveredParcels = await Parcel.countDocuments({receiver:receiverId, status: PARCEL_STATUS.DELIVERED});
    const intransitParcels = await Parcel.countDocuments({receiver:receiverId, status: PARCEL_STATUS.IN_TRANSIT});

    const canceledParcel = await Parcel.countDocuments({receiver:receiverId, status: PARCEL_STATUS.CANCELED});
    
    const monthlyPacelStats = await Parcel.aggregate([
        {$match: {receiver: new mongoose.Types.ObjectId(receiverId)}},
        {$group:{
            _id: {
                month: {$month: "$createdAt"},
                year: {$year: "$createdAt"},
            },
            delivered:{$sum:{$cond:[{$eq:["$status", PARCEL_STATUS.DELIVERED]}, 1, 0]}},
            intransit:{$sum:{$cond:[{$eq:["$status", PARCEL_STATUS.IN_TRANSIT]}, 1, 0]}},
            canceled:{$sum:{$cond:[{$eq:["$status", PARCEL_STATUS.CANCELED]}, 1, 0]}},
            total: {$sum:1}
        }},
        {$sort: {"_id.year": 1, "_id.month": 1}}
    ])
    return {
        totalPacelReceived,
        deliveredParcels,
        intransitParcels,
        canceledParcel,
        monthlyPacelStats
    }
}

const updateParcelStatus = async (parcelId: string, status: PARCEL_STATUS, adminId: string) => {
    console.log("updateParcelStatus", parcelId, status, adminId)
    const parcel = await Parcel.findById(parcelId)
    if (!parcel) {
        throw new AppError(401, "Parcel not found")
    }
    const currentStatus = parcel.status
    const validTransitions: Record<PARCEL_STATUS, PARCEL_STATUS[]> = {
        [PARCEL_STATUS.REQUESTED]: [PARCEL_STATUS.APPROVED, PARCEL_STATUS.CANCELED, PARCEL_STATUS.BLOCKED, PARCEL_STATUS.UNBLOCKED],
        [PARCEL_STATUS.APPROVED]: [PARCEL_STATUS.DISPATCHED],
        [PARCEL_STATUS.DISPATCHED]: [PARCEL_STATUS.IN_TRANSIT],
        [PARCEL_STATUS.IN_TRANSIT]: [],
        [PARCEL_STATUS.DELIVERED]: [],
        [PARCEL_STATUS.CANCELED]: [],
        [PARCEL_STATUS.BLOCKED]: [PARCEL_STATUS.UNBLOCKED],
        [PARCEL_STATUS.UNBLOCKED]: [PARCEL_STATUS.BLOCKED, PARCEL_STATUS.APPROVED],
    }
    if (!validTransitions[currentStatus]?.includes(status)) {
        throw new AppError(401, `Cannot update parcel status ${currentStatus} to ${status}`)
    }


    parcel.status = status;
    parcel.statusLogs.push({
        status: status,
        note: "Update by Admin",
        updatedBy: new Types.ObjectId(adminId)
    })
    await parcel.save()
    return parcel
}

const blockParcel = async (parcelId: string, adminId: string) => {
    const parcel = await Parcel.findById(parcelId)
    if (!parcel) {
        throw new AppError(401, "Parcel not found")
    }
    if (parcel.status === "DELIVERED" || parcel.status === "CANCELED") {
        throw new AppError(401, "Delivered or canceled parcels cannot be blocked")
    }

    parcel.isBlocked = !parcel.isBlocked;

    parcel.statusLogs.push({
        status: parcel.isBlocked ? PARCEL_STATUS.BLOCKED : PARCEL_STATUS.APPROVED,
        note: `Parcel ${parcel.isBlocked ? PARCEL_STATUS.BLOCKED : PARCEL_STATUS.UNBLOCKED} by Admin`,
        updatedBy: new Types.ObjectId(adminId)
    })


    await parcel.save()
    return parcel
}


const getTrackingParcel = async (trackingId: string) => {
    const parcel = await Parcel.findOne({ trackingId })
        .populate("sender", "name email phone")
        .populate("receiver", "name email phone")

    if (!parcel) {
        throw new AppError(401, "Parcel not found with this tracking ID")
    }

    // parcel.isBlocked = !parcel.isBlocked;

    return {
        trackingId: parcel.trackingId,
        status: parcel.status,
        deliveryAddress: parcel.deliveryAddress,
        pickupAddress: parcel.pickupAddress,
        fee: parcel.fee,
        sender: parcel.sender,
        receiver: parcel.receiver,
        statusLogs: parcel.statusLogs
    }
}
const getPublicTrackingParcel = async (trackingId: string) => {
    const parcel = await Parcel.findOne({ trackingId })
        .select("trackingId status deliveryAddress pickupAddress fee sender receiver statusLogs")

    if (!parcel) {
        throw new AppError(401, "Parcel not found with this tracking ID")
    }

    return {
        trackingId: parcel.trackingId,
        status: parcel.status,
        deliveryAddress: parcel.deliveryAddress,
        pickupAddress: parcel.pickupAddress,
        fee: parcel.fee,
        sender: parcel.sender,
        receiver: parcel.receiver,
        statusLogs: parcel.statusLogs
    }
}


export const ParcelService = {
    createParcel,
    getAllParcel,
    getParcelStatusLog,
    cancelParcel,
    getIncomingParcels,
    getDeliveryHistory,
    confirmDelivery,
    getAllParcels,
    getAnalytics,
    getSenderAnalytics,
    getReceiverAnalytics,
    updateParcelStatus,
    blockParcel,
    getTrackingParcel,
    getPublicTrackingParcel
}