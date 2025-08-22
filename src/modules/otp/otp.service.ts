

import crypto from "crypto"
import { User } from "../user/user.model";

import { redisClient } from "../../config/redis.config";
import AppError from "../../errorHandler/AppError";
import { sendEmail } from "../../utils/sendEmail";



const OTP_EXPIRATION = 2 * 60 // 2minute
  
const generateOtp = (length=6) => {
   const otp = crypto.randomInt(10 ** length).toString()
   return otp
}

const sendOTP = async (email: string, name: string) => {
   const user = await User.findOne({email})
   if(!user){
    throw new AppError(404, "User not found")
   }
   if(user.isVarified){
    throw new AppError(401, "Your are already verified")
   }
   const otp = generateOtp()
   const redisKey = `otp:${email}`

   await redisClient.set(redisKey, otp, {
    expiration: {
        type: 'EX',
        value: OTP_EXPIRATION
    }
   })
   await sendEmail({
      to: email,
      subject: "Your OTP Code",
      templateName: "otp",
      templateData: {
         name: name,
         otp: otp,
      }
   })
}
const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({email})
   if(!user){
    throw new AppError(404, "User not found")
   }
   if(user.isVarified){
    throw new AppError(401, "You are already verified")
   }
   const redisKey = `otp:${email}`
   const saveOtp = await redisClient.get(redisKey)

    if(!saveOtp){
    throw new AppError(401, "Invalid OTP")
   }
    if(saveOtp !== otp){
    throw new AppError(401, "Invalid OTP")
   }
   await Promise.all([
      User.updateOne({email}, {isVarified: true}, {runValidators:true}),
      redisClient.del([redisKey])
   ])
}



export const OTPService = {
   sendOTP,
   verifyOTP
}