import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ParcelRoutes } from "../modules/parcel/parcel.route";


export const router = Router()


const moduleRouters = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/parcels",
        route: ParcelRoutes
    },
]


moduleRouters.forEach((route) => {
    router.use(route.path, route.route)
})