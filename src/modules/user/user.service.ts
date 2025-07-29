import { IAuthProvider, IUser } from "./user.interface";
import bcryptjs from "bcryptjs"
import { User } from "./user.model";



const createUser = async(payload: Partial<IUser>) =>{
    const {email, password, ...rest} = payload;

    const isUserExist = await User.findOne({email})
    if(isUserExist){
        throw new Error("User already exist")
    }
    const hashedPassword = await bcryptjs.hash(password as string, 10)
    
    const authProvider: IAuthProvider = {provider: "credential", providerId: email as string}

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })

    return user
}



export const UserService = {
    createUser
}