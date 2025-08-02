/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { getTrackingId } from "../../utils/getTrackingId";
import { IParcel, PARCEL_STATUS } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHandler/AppError";
import httpStatus from "http-status-codes"




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
const getAllParcels = async (filters: { status?: string, sender?: string, receiver?: string }) => {
    const query: any = {}

    if (filters.status) {
        query.status = filters.status
    }
    if (filters.sender) {
        query.sender = filters.sender
    }
    if (filters.receiver) {
        query.receiver = filters.receiver
    }



    const parcels = await Parcel.find(query)
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .sort({ createdAt: -1 })

    const totalParcel = await Parcel.countDocuments(query)
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    }
}

const updateParcelStatus = async (parcelId: string, newStatus: PARCEL_STATUS, adminId: string) => {
    const parcel = await Parcel.findById(parcelId)
    if (!parcel) {
        throw new AppError(401, "Parcel not found")
    }
    const currentStatus = parcel.status
    const validTransitions: Record<PARCEL_STATUS, PARCEL_STATUS[]> = {
        [PARCEL_STATUS.REQUESTED]: [PARCEL_STATUS.APPROVED],
        [PARCEL_STATUS.APPROVED]: [PARCEL_STATUS.DISPATCHED],
        [PARCEL_STATUS.DISPATCHED]: [PARCEL_STATUS.IN_TRANSIT],
        [PARCEL_STATUS.IN_TRANSIT]: [PARCEL_STATUS.DELIVERED],
        [PARCEL_STATUS.DELIVERED]: [],
        [PARCEL_STATUS.CANCELED]: [],
        [PARCEL_STATUS.BLOCKED]: [],
        [PARCEL_STATUS.UNBLOCKED]: []
    }
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
        throw new AppError(401, `Cannot update parcel status ${currentStatus} to ${newStatus}`)
    }


    parcel.status = newStatus;
    parcel.statusLogs.push({
        status: newStatus,
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

    parcel.isBlocked = !parcel.isBlocked;

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
    updateParcelStatus,
    blockParcel,
    getTrackingParcel
}