/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStratery, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs"


passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })
            // if (!isUserExist) {
            //     return done(null, false, {message: "User  does not Exist"})
            // }
            if (!isUserExist) {
                return done("User  does not Exist")
            }
            if (!isUserExist.isVarified) {
                // throw new AppError(httpStatus.BAD_REQUEST, "User is not deleted")
                done("User is not deleted")
            }
            if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
                // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
                done(`User is ${isUserExist.isActive}`)
            }
            if (isUserExist.isDeleted) {
                // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
                done("User is deleted")
            }



            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider === "google")
            // if(isGoogleAuthenticated){
            //     return done(null, false, {message: "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password."})
            // }
            if (isGoogleAuthenticated && !isUserExist.password) {
                return done("You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password.")
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)
            if (!isPasswordMatched) {
                return done(null, false, { message: "Password does not match" })
            }

            return done(null, isUserExist)
        } catch (error) {
            console.log(error)
            done(error)
        }
    })
)



passport.use(
    new GoogleStratery(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(null, false, { message: "No email found" })
                }
                let isUserExist = await User.findOne({ email })
                if (isUserExist && !isUserExist.isVarified) {
                    // throw new AppError(httpStatus.BAD_REQUEST, "User is not deleted")
                    return done(null, false, {message: "user is not verified"})
                }
                if (isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)) {
                    // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
                    done(`User is ${isUserExist.isActive}`)
                }
                if (isUserExist && isUserExist.isDeleted) {
                    // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
                     return done(null, false, { message: "User is deleted" })
                }
                if (!isUserExist) {
                    isUserExist = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.RECEIVER,
                        isVarified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    })
                }
                return done(null, isUserExist)
            } catch (error) {
                console.log("Google Strategy Error", error)
                return done(error)
            }
        }
    )
)

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access


passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (error) {
        console.log(error)
        done(error)
    }
})