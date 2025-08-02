/* eslint-disable @typescript-eslint/no-explicit-any */
// import AppError from "../../errorHandler/AppError"
// import { IUser } from "../user/user.interface"
// import { User } from "../user/user.model"
// import httpStatus from "http-status-codes"
// import bcryptjs from "bcryptjs"
import { createNewAccessTokenWithRefreshToken} from "../../utils/userTokens"
// import { JwtPayload } from "jsonwebtoken"
// import { envVars } from "../../config/env"


// const credentialsLogin = async (payload: Partial<IUser>) => {
//     const { email, password } = payload

//     const isUserExist = await User.findOne({ email })
//     if (!isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User Email does not Exist")
//     }

//     const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)
//     if (!isPasswordMatched) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
//     }
  
//     const userTokens = createUserToken(isUserExist)


//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { password: PASS, ...rest } = isUserExist.toObject()
//     return {
//         accessToken: userTokens.accessToken,
//         refreshToken: userTokens.refreshToken,        
//         user: rest,
//         // email: isUserExist.email
//     }
// }
const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)
    return {
        accessToken: newAccessToken
    }
}



export const AuthServices = {
    // credentialsLogin,
    getNewAccessToken,

}