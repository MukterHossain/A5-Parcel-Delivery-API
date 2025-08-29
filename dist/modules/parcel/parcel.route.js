"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const parcel_controller_1 = require("./parcel.controller");
const router = (0, express_1.Router)();
// Sender
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.createParcel);
router.get("/me", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.getAllParcel);
router.patch("/cancel/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.cancelParcel);
router.get("/analytic", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.getSenderAnalytics);
// Sender and Receiver
router.get("/:id/status-log", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.getParcelStatusLog);
// Receiver
router.get("/incoming", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.getIncomingParcels);
router.patch("/confirm-delivery/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.confirmDelivery);
router.get("/delivery-history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.getDeliveryHistory);
router.get("/analytics", (0, checkAuth_1.checkAuth)(user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.getReceiverAnalytics);
// ‍Admin
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), parcel_controller_1.ParcelController.getAllParcels);
router.get("/admin-analytics", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), parcel_controller_1.ParcelController.getAnalytics);
router.patch("/status-update/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), parcel_controller_1.ParcelController.updateParcelStatus);
router.patch("/block/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), parcel_controller_1.ParcelController.blockParcel);
router.get("/track/:trackingId", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.getTrackingParcel);
router.get("/track/public/:trackingId", parcel_controller_1.ParcelController.getPublicTrackingParcel);
exports.ParcelRoutes = router;
