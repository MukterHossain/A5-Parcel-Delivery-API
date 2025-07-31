import AppError from "../../errorHandler/AppError"
import { IUser } from "../user/user.interface"
import { User } from "../user/user.model"
import httpStatus from "http-status-codes"
import bcryptjs from "bcryptjs"
import jwt  from "jsonwebtoken"
import { envVars } from "../../config/env"

// import { generateToken } from "../../utils/jwt"
// import { envVars } from "../../config/env"
// import { JwtPayload } from "jsonwebtoken"

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload

    const isUserExist = await User.findOne({ email })
    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Email does not Exist")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role   
    }
    // const accessToken = generateToken(JwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRE)
    const accessToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {expiresIn: "2d"} )

    
    // const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    // const userTokens = createUserToken(isUserExist)

    // delete isUserExist.password;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { password: PASS, ...rest } = isUserExist.toObject()
    return {
        // accessToken: userTokens.accessToken,
        // refreshToken: userTokens.refreshToken,
        // user: rest
        email: accessToken
        // email: isUserExist.email
    }
}



export const AuthServices = {
    credentialsLogin,
    // getNewAccessToken,
    // forgotPassword,
    // changePassword,
    // resetPassword,
    // setPassword,

}