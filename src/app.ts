

import express, { Request, Response } from 'express';
import cors from "cors"
import { router } from './routes';
import notFound from './middlewares/notFound';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import cookieParser from 'cookie-parser'
import passport from 'passport';
import expressSession from "express-session"
import { envVars } from './config/env';
import "./config/passport"


const app = express()
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(express.json())
app.set("trust proxy", 1)
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))


app.use("/api", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to the Parcel Delivery API"
    })
})

app.use(globalErrorHandler)
app.use(notFound)





export default app;