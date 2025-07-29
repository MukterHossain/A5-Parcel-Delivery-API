import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";


export const router = Router()


const moduleRouters =[
    {
        path: "/user",
        route: UserRoutes
    }
]


moduleRouters.forEach((route) => {
    router.use(route.path, route.route)
})