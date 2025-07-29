
import dotenv from "dotenv"

dotenv.config()


interface EnvConfig{
    PORT: string,
    DB_URL: string,
    NODE_ENV:string,
}


const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] =["PORT", "DB_URL", "NODE_ENV"];
    requiredEnvVariables.forEach(key => {
        if(!process.env[key]){
            throw new Error(`Environment variable ${key} is not defined`)
        }
    })
    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV:process.env.NODE_ENV as string,
    }
}


export const envVars: EnvConfig = loadEnvVariables()