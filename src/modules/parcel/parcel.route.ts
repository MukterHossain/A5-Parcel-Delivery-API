import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ParcelController } from "./parcel.controller";

const router = Router()




router.post("/", checkAuth(Role.SENDER), ParcelController.createParcel)
router.get("/me", checkAuth(Role.SENDER), ParcelController.getAllParcel)
router.get("/incoming", checkAuth(Role.RECEIVER), ParcelController.getIncomingParcels)



export const ParcelRoutes = router