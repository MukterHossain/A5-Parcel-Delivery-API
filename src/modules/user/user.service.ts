import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs"
import { User } from "./user.model";
import AppError from "../../errorHandler/AppError";
import httpstatus from "http-status-codes"
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";



const createUser = async (payload: Partial<IUser>) => {

    const { email, password, role, ...rest } = payload;
 
    const isUserExist = await User.findOne({ email })
    if (isUserExist) {
        throw new AppError(httpstatus.BAD_REQUEST, "User already exist")
    }
    if (role === Role.ADMIN) {
        throw new AppError(httpstatus.BAD_REQUEST, "Admin already exist!")
    }
    if (role === Role.SUPER_ADMIN) {
        throw new AppError(httpstatus.BAD_REQUEST, "Super Admin already exist!")
    }
    const hashedPassword = await bcryptjs.hash(password as string, 10)

    const authProvider: IAuthProvider = { provider: "credential", providerId: email as string }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        role,
        ...rest
    })

    return user
}


const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const ifUserExist = await User.findById(userId)
    if (!ifUserExist) {
        throw new AppError(httpstatus.NOT_FOUND, "User not Found")
    }
    if (decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(401, "You are not authorized")
    }


    if (payload.role) {
        if (decodedToken.role === Role.SENDER || decodedToken.role === Role.RECEIVER) {
            throw new AppError(httpstatus.FORBIDDEN, "You are not authorized")
        }
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpstatus.FORBIDDEN, "You are not authorized")
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVarified) {
        if (decodedToken.role === Role.SENDER || decodedToken.role === Role.RECEIVER) {
            throw new AppError(httpstatus.FORBIDDEN, "You are not authorized")
        }
    }
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }
    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })
    return newUpdatedUser
}

const getMe = async (userId:string) => {
    const user = await User.findById(userId).select("-password")

    return {
        data: user
    }
}
const getAllUsers = async () => {

    const users = await User.find()
    const totalUsers = await User.countDocuments()

    return {
        data: users,
        meta: {
            total: totalUsers
        }
    }
}

const getAllReceivers = async () => {

    const users = await User.find({role: Role.RECEIVER}).select("_id name email")

    return {
        data: users
    }
}
const blockUser = async (userId: string) => {

    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpstatus.NOT_FOUND, "User not found")
    }
    if (user.isActive === IsActive.BLOCKED) {
        throw new AppError(httpstatus.BAD_REQUEST, "User is already blocked!")
    }
    if (user.role === Role.ADMIN) {
        throw new AppError(httpstatus.BAD_REQUEST, "Your not authorized to unblock this user")
    }
    if (user.role === Role.SUPER_ADMIN) {
        throw new AppError(httpstatus.BAD_REQUEST, "Your not authorized to unblock this user")
    }
    user.isActive = IsActive.BLOCKED
    await user.save()

    return user;
}
const unblockUser = async (userId: string) => {

    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpstatus.NOT_FOUND, "User not found")
    }
    if (user.isActive === IsActive.ACTIVE) {
        throw new AppError(httpstatus.BAD_REQUEST, "User is already active")
    }
    
    user.isActive = IsActive.ACTIVE
    await user.save()

    return user;
}
const updateUserRole = async (adminId: string, userId: string, role: Role) => {

    if (adminId === userId) {
        throw new AppError(httpstatus.BAD_REQUEST, "You cannot change your own role")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new AppError(httpstatus.NOT_FOUND, "User not found")
    }
    if (role === Role.ADMIN) {
        throw new AppError(httpstatus.BAD_REQUEST, "Admin already exists.")
    }
    user.role = role

    await user.save()

    return user;
}



export const UserService = {
    createUser,
    getAllUsers,
    getAllReceivers,
    getMe,
    updateUser,
    blockUser,
    unblockUser,
    updateUserRole
}