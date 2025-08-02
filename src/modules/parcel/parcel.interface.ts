import { Types } from "mongoose";

export enum PARCEL_STATUS{
    REQUESTED = "REQUESTED",
    APPROVED= "APPROVED",
    DISPATCHED = "DISPATCHED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELED = "CANCELED",
    BLOCKED = "BLOCKED",
    UNBLOCKED = "UNBLOCKED",
}

export interface IStatusLog{
    status: PARCEL_STATUS;
    location?: string;
    note?: string;
    updatedBy?: Types.ObjectId  // IUser
}

export interface IParcel{
    _id: Types.ObjectId;
    sender:Types.ObjectId;
    receiver: Types.ObjectId;
    type?:string;
    weight?:number;
    fee?: number;
    trackingId?:string;
    description?: string;
    pickupAddress?:string;
    deliveryAddress?: string;
    status: PARCEL_STATUS;
    statusLogs: IStatusLog[];
    isBlocked?: boolean;
    deliveryDate?: Date;
    updatedAt?: Date;

}