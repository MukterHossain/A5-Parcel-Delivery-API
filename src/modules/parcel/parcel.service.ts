/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { getTrackingId } from "../../utils/getTrackingId";
import { IParcel, PARCEL_STATUS } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHandler/AppError";




const createParcel = async(payload: Partial<IParcel>, senderId: string) =>{
const parcelCount = await Parcel.countDocuments()
const trackingId = getTrackingId(parcelCount + 1)



const parcel = await Parcel.create({
    ...payload,
    sender:senderId,
    trackingId,
    status: PARCEL_STATUS.REQUESTED,
    statusLogs: [{
        status: PARCEL_STATUS.REQUESTED,
        location: payload.pickupAddress || "Unknown",
        note:"Parcel Request created",
        updatedBy: senderId
    }]
})

return parcel
}


const getAllParcel = async(senderId:string) =>{

const parcels = await Parcel.find({sender:senderId}).sort({createdAt: -1})
const totalParcel = await Parcel.countDocuments()
return {
    data:parcels,
    meta:{
        total:totalParcel
    }
}
}
const getIncomingParcels = async(receiverId:string) =>{

    
const parcels = await Parcel.find({receiver: new Types.ObjectId(receiverId)}).sort({createdAt: -1})
// console.log("incoming parcels", parcels)
const totalParcel = await Parcel.countDocuments({receiver: receiverId})
return {
    data:parcels,
    meta:{
        total:totalParcel
    }
}
}
const cancelParcel = async(parcelId: string, senderId:string) =>{

    const parcel = await Parcel.findOne({_id:parcelId, sender: senderId})
    if(!parcel){
        throw new AppError(401, "Parcel not found or you are not authorized")
    }
    if(parcel.status !== PARCEL_STATUS.REQUESTED && parcel.status !== PARCEL_STATUS.APROVED){
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
const confirmDelivery = async(parcelId: string, receiverId:string) =>{

    // const debugParcel = await Parcel.findById(parcelId)
    // console.log("Debug parcel", debugParcel)

    // console.log("checking with", {
    //     _id: parcelId,
    //     receiver:receiverId
    // })
    const parcel = await Parcel.findOne({_id:parcelId, receiver: receiverId})
    // console.log("parcel", parcel)
    if(!parcel){
        throw new AppError(401, "Delivery parcel not found or you are not authorized")
    }
    // console.log("current status", parcel.status)
    // console.log("enum status", PARCEL_STATUS.IN_TRANSIT)
    // console.log("Equal?", parcel.status === PARCEL_STATUS.IN_TRANSIT)
    if(parcel.status !== PARCEL_STATUS.IN_TRANSIT){
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
const getAllParcels = async(filters: {status?:string, sender?:string, receiver?:string}) =>{
const query: any = {}

if(filters.status){
    query.status = filters.status
}
if(filters.sender){
    query.sender = filters.sender
}
if(filters.receiver){
    query.receiver = filters.receiver
}

  
    
const parcels = await Parcel.find(query)
.populate("sender", "name email")
.populate("receiver", "name email")
.sort({createdAt: -1})

const totalParcel = await Parcel.countDocuments(query)
return {
    data:parcels,
    meta:{
        total:totalParcel
    }
}
}

const updateParcelStatus = async(parcelId:string, newStatus:PARCEL_STATUS, adminId: string) =>{
const parcel = await Parcel.findById(parcelId)
if(!parcel){
    throw new AppError(401, "Parcel not found")
}
const currentStatus = parcel.status
const validTransitions: Record<PARCEL_STATUS, PARCEL_STATUS[]> = {
    [PARCEL_STATUS.REQUESTED] : [PARCEL_STATUS.APROVED],
    [PARCEL_STATUS.APROVED] : [PARCEL_STATUS.DISPATCHED],
    [PARCEL_STATUS.DISPATCHED] : [PARCEL_STATUS.IN_TRANSIT],
    [PARCEL_STATUS.IN_TRANSIT] : [PARCEL_STATUS.DELIVERED],
    [PARCEL_STATUS.DELIVERED] :[],
    [PARCEL_STATUS.CANCELED] : [],
    [PARCEL_STATUS.BLOCKED] : []
}
if(!validTransitions[currentStatus]?.includes(newStatus)){
    throw new AppError(401, `Cannot update parcel status ${currentStatus} to ${newStatus}` )
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


export const ParcelService = {
    createParcel,
    getAllParcel,
    getIncomingParcels,
    cancelParcel,
    confirmDelivery,
    getAllParcels,
    updateParcelStatus
}