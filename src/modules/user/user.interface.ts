import { Types } from "mongoose";

export enum Role{
    SUPER_ADMIN= "SUPER_ADMIN",
    ADMIN= "ADMIN",
    SENDER= "SENDER",
    RECEIVER= "RECEIVER"
}

export interface IAuthProvider{
    provider: "google" | "credential";    // Google, Credential
    providerId: string;
}
export interface ISender extends IUser{
    role: Role.SENDER
}
export interface IReceiver extends IUser{
    role: Role.RECEIVER
}

export enum IsActive{
    ACTIVE= "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IUser{
    _id?: Types.ObjectId; 
    name: string;
    email: string;
    password ?: string;
    phone ?: string;
    picture ?: string;
    address ?: string;
    isDeleted ?: string;
    isActive ?: IsActive;
    isVarified ?: boolean;
    role: Role;
    auths: IAuthProvider[];
    parcels ?: Types.ObjectId[];
    orders ?: Types.ObjectId[];
    createdAt?: Date

}