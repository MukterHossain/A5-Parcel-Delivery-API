import { model, Schema } from "mongoose";
import { IParcel, IStatusLog, PARCEL_STATUS } from "./parcel.interface";



const statusLogShema = new Schema<IStatusLog>({
    status: {
        type: String,
        enum: Object.values(PARCEL_STATUS),
        default:PARCEL_STATUS.REQUESTED
    },
    location: {type: String},
    note: {type: String},
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{
    _id:false
})
export const StatusLog = model<IStatusLog>("StatusLog", statusLogShema)

const parcelShema = new Schema<IParcel>({
    sender: {
        type: Schema.Types.ObjectId,
        ref:"User", required:true
    },
        receiver: {
        type: Schema.Types.ObjectId,
        ref:"User", required:true
    },
        type: {type:String},
        weight:{type: Number},
        fee: {type: Number},
        trackingId:{type:String, required:true, unique:true},
        description: {type: String},
        pickupAddress:{type: String},
        deliveryAddress: {type: String},
        status: {
            type:String,
            enum: Object.values(PARCEL_STATUS),
            default: PARCEL_STATUS.REQUESTED
        },
        statusLogs: [statusLogShema],
        isBlocked: {type: Boolean, default: false},
        deliveryDate: Date
},{
    timestamps:true,
    versionKey: false
})



export const Parcel = model<IParcel>("Parcel", parcelShema)