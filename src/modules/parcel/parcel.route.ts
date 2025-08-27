import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { ParcelController } from "./parcel.controller";

const router = Router()




// Sender
router.post("/", checkAuth(Role.SENDER), ParcelController.createParcel)
router.get("/me", checkAuth(Role.SENDER), ParcelController.getAllParcel)
router.patch("/cancel/:id", checkAuth(Role.SENDER), ParcelController.cancelParcel)
router.get("/analytic", checkAuth(Role.SENDER), ParcelController.getSenderAnalytics)


// Sender and Receiver
router.get("/:id/status-log", checkAuth(Role.SENDER, Role.RECEIVER), ParcelController.getParcelStatusLog)

// Receiver
router.get("/incoming", checkAuth(Role.RECEIVER), ParcelController.getIncomingParcels)
router.patch("/confirm-delivery/:id", checkAuth(Role.RECEIVER), ParcelController.confirmDelivery)
router.get("/delivery-history", checkAuth(Role.RECEIVER), ParcelController.getDeliveryHistory)
router.get("/Analytic", checkAuth(Role.RECEIVER), ParcelController.getReceiverAnalytics)


// ‍Admin
router.get("/", checkAuth(Role.ADMIN), ParcelController.getAllParcels)
router.get("/analytics", checkAuth(Role.ADMIN), ParcelController.getAnalytics)
router.patch("/status-update/:id", checkAuth(Role.ADMIN), ParcelController.updateParcelStatus)
router.patch("/block/:id", checkAuth(Role.ADMIN), ParcelController.blockParcel)


router.get("/track/:trackingId", checkAuth(...Object.values(Role)), ParcelController.getTrackingParcel)




export const ParcelRoutes = router