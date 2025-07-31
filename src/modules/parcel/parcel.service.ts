import { Types } from "mongoose";
import { getTrackingId } from "../../utils/getTrackingId";
import { IParcel, PARCEL_STATUS } from "./parcel.interface";
import { Parcel } from "./parcel.model";



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


export const ParcelService = {
    createParcel,
    getAllParcel,
    getIncomingParcels
}