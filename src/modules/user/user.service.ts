import { IAuthProvider, IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs"
import { User } from "./user.model";
import AppError from "../../errorHandler/AppError";
import httpstatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";



const createUser = async(payload: Partial<IUser>) =>{
    console.log("received Role from payload", payload.role)
    const {email, password, role, ...rest} = payload;
console.log("Payload", payload)
console.log("role", role)
    const isUserExist = await User.findOne({email})
    if(isUserExist){
        throw new AppError(httpstatus.BAD_REQUEST, "User already exist")
    }
    const hashedPassword = await bcryptjs.hash(password as string, 10)
    
    const authProvider: IAuthProvider = {provider: "credential", providerId: email as string}

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        role,
        ...rest
    })

    return user
}


const updateUser = async(userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) =>{
    const ifUserExist = await User.findById(userId)
    if(!ifUserExist){
        throw new AppError(httpstatus.NOT_FOUND, "User not Found")
    }
    if (decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(401, "You are not authorized")
    }


    if(payload.role){
        if(decodedToken.role === Role.SENDER || decodedToken.role === Role.RECEIVER){
            throw new AppError(httpstatus.FORBIDDEN, "You are not authorized")
        }
        if(payload.role === Role.SUPER_ADMIN &&  decodedToken.role === Role.ADMIN){
            throw new AppError(httpstatus.FORBIDDEN, "You are not authorized")
        }
    }
    if(payload.isActive || payload.isDeleted || payload.isVarified){
        if(decodedToken.role === Role.SENDER || decodedToken.role === Role.RECEIVER){
            throw new AppError(httpstatus.FORBIDDEN, "You are not authorized")
        }
    }
    if(payload.password){
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }
    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})
    return newUpdatedUser
}


const getAllUsers = async() =>{

    const users = await User.find()
    const totalUsers = await User.countDocuments()
    console.log(totalUsers)
   
    return {
        data:users,
        meta: {
            total: totalUsers
        }
    }
}



export const UserService = {
    createUser,
    getAllUsers,
    updateUser
}