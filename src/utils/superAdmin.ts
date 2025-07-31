/* eslint-disable no-console */
import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface"
import { User } from "../modules/user/user.model"
import bcryptjs from "bcryptjs"


export const superAdmin = async() =>{
    try {
        const isSuperAdminExist = await User.findOne({email: envVars.SUPER_ADMIN_EMAIL})
        if(isSuperAdminExist){
            console.log("Supper Admin Already Exists!")
            return 
        }
        console.log("Trying to Supper Admin!")
        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider : IAuthProvider = {
            provider: 'credential',
            providerId: envVars.SUPER_ADMIN_EMAIL
        }
        const payload : IUser ={
            name: "Super admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVarified: true,
            auths: [authProvider]
        }
        const superAdmin = await User.create(payload)
        console.log("Supper Admin Created Successfully!")
        console.log(superAdmin)
    } catch (error) {
        console.log(error)
    }
}