import { Types } from "mongoose";

export enum PARCEL_STATUS{
    REQUESTED = "REQUESTED",
    APROVED= "APROVED",
    DISPATCHED = "DISPATCHED",
    IN_TRANSIT = "IN TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELED = "CANCELED",
    BLOCKED = "BLOCKED",
}

export interface IStatusLog{
    status: PARCEL_STATUS;
    location?: string;
    note?: string;
    timestamp?:Date;
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
    createdAt?: Date;

}