import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ParcelController } from "./parcel.controller";

const router = Router()




router.post("/", checkAuth(Role.SENDER), ParcelController.createParcel)
router.get("/me", checkAuth(Role.SENDER), ParcelController.getAllParcel)
router.get("/incoming", checkAuth(Role.RECEIVER), ParcelController.getIncomingParcels)
router.patch("/cancel/:id", checkAuth(Role.SENDER), ParcelController.cancelParcel)
router.patch("/confirm-delivery/:id", checkAuth(Role.RECEIVER), ParcelController.confirmDelivery)


// ‍Admin
router.get("/", checkAuth(Role.ADMIN), ParcelController.getAllParcels)
router.patch("/:id/status", checkAuth(Role.ADMIN), ParcelController.updateParcelStatus)




export const ParcelRoutes = router