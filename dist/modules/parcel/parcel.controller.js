"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const parcel_service_1 = require("./parcel.service");
const AppError_1 = __importDefault(require("../../errorHandler/AppError"));
const parcel_model_1 = require("./parcel.model");
const parcel_interface_1 = require("./parcel.interface");
const createParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.user;
    if (!sender) {
        throw new AppError_1.default(401, "You are not authorized");
    }
    const result = yield parcel_service_1.ParcelService.createParcel(req.body, sender.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Parcel created successfully",
        data: result
    });
}));
const getAllParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.user;
    if (!sender) {
        throw new AppError_1.default(401, "You are not authorized");
    }
    const result = yield parcel_service_1.ParcelService.getAllParcel(sender.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "All parcel retrived successfully",
        data: result.data,
        meta: result.meta
    });
}));
const getParcelStatusLog = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: parcelId } = req.params;
    const result = yield parcel_service_1.ParcelService.getParcelStatusLog(parcelId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Parcel status logs retrived successfully",
        data: result
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcelId = req.params.id;
    const result = yield parcel_service_1.ParcelService.cancelParcel(parcelId, user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Parcel cancel successfully",
        data: result
    });
}));
const getIncomingParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.Parcel.find().limit(1);
    const receiverId = req.user;
    if (!receiverId) {
        throw new AppError_1.default(401, "You are not authorized");
    }
    const result = yield parcel_service_1.ParcelService.getIncomingParcels(receiverId.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Incoming parcels retrived successfully",
        data: result.data,
        meta: result.meta
    });
}));
const getDeliveryHistory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverId = req.user;
    if (!receiverId) {
        throw new AppError_1.default(401, "Unauthorized: Receiver ID not found");
    }
    const result = yield parcel_service_1.ParcelService.getDeliveryHistory(receiverId.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Incoming parcels retrived successfully",
        data: result.data,
        meta: result.meta
    });
}));
const confirmDelivery = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcelId = req.params.id;
    const result = yield parcel_service_1.ParcelService.confirmDelivery(parcelId, user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "Parcel delivery successfully",
        data: result
    });
}));
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, sender, receiver } = req.query;
    const filters = {
        status: status,
        sender: sender,
        receiver: receiver
    };
    const result = yield parcel_service_1.ParcelService.getAllParcels(filters);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: "All parcel retrived successfully",
        data: result
    });
}));
const updateParcelStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const admin = req.user;
    const adminId = admin.userId;
    const result = yield parcel_service_1.ParcelService.updateParcelStatus(id, status, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: `Status updated to ${status}`,
        data: result
    });
}));
const blockParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const admin = req.user;
    const adminId = admin.userId;
    const result = yield parcel_service_1.ParcelService.blockParcel(id, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: `Parcel ${result.isBlocked ? parcel_interface_1.PARCEL_STATUS.BLOCKED : parcel_interface_1.PARCEL_STATUS.UNBLOCKED}`,
        data: result
    });
}));
const getTrackingParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const result = yield parcel_service_1.ParcelService.getTrackingParcel(trackingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: `Parcel tracking data retrieved successfully`,
        data: result
    });
}));
exports.ParcelController = {
    createParcel,
    getAllParcel,
    getIncomingParcels,
    getParcelStatusLog,
    cancelParcel,
    getDeliveryHistory,
    confirmDelivery,
    getAllParcels,
    updateParcelStatus,
    blockParcel,
    getTrackingParcel
};
