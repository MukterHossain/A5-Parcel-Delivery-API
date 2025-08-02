/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './config/env';
import { superAdmin } from './utils/superAdmin';




let server: Server;


const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)
        console.log("Connected to MongoDB!");
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on port ${envVars.PORT} `);
        })
    } catch (error) {
        console.log(error)
    }
}



(async () => {
    await startServer()
    await superAdmin()
})()





process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection! Shutting down the server...", err);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

// uncaughtException  error
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception! Shutting down the server...", err);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})


// SIGTERM error
process.on("SIGTERM", ()=>{
    console.log("SIGTERM signal recieved! Shutting down the server...");
    if(server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})
