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
exports.ParcelService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const getTrackingId_1 = require("../../utils/getTrackingId");
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = require("./parcel.model");
const AppError_1 = __importDefault(require("../../errorHandler/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createParcel = (payload, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelCount = yield parcel_model_1.Parcel.countDocuments();
    const trackingId = (0, getTrackingId_1.getTrackingId)(parcelCount + 1);
    const parcel = yield parcel_model_1.Parcel.create(Object.assign(Object.assign({}, payload), { sender: senderId, trackingId, status: parcel_interface_1.PARCEL_STATUS.REQUESTED, statusLogs: [{
                status: parcel_interface_1.PARCEL_STATUS.REQUESTED,
                location: payload.pickupAddress || "Unknown",
                note: "Parcel Request created",
                updatedBy: senderId
            }] }));
    return parcel;
});
const getAllParcel = (senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.Parcel.find({ sender: senderId }).sort({ createdAt: -1 });
    const totalParcel = yield parcel_model_1.Parcel.countDocuments({ sender: senderId });
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    };
});
const getParcelStatusLog = (parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId).select("statusLogs");
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Parcel not found");
    }
    return parcel;
});
const cancelParcel = (parcelId, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findOne({ _id: parcelId, sender: senderId });
    if (!parcel) {
        throw new AppError_1.default(401, "Parcel not found or you are not authorized");
    }
    if (parcel.status !== parcel_interface_1.PARCEL_STATUS.REQUESTED && parcel.status !== parcel_interface_1.PARCEL_STATUS.APPROVED) {
        throw new AppError_1.default(401, "Cannot cancel dispatch parcel");
    }
    parcel.status = parcel_interface_1.PARCEL_STATUS.CANCELED;
    parcel.statusLogs.push({
        status: parcel_interface_1.PARCEL_STATUS.CANCELED,
        note: "Parcel canceled by sender",
        updatedBy: new mongoose_1.Types.ObjectId(senderId)
    });
    yield parcel.save();
    return parcel;
});
const getIncomingParcels = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.Parcel.find({ receiver: new mongoose_1.Types.ObjectId(receiverId), status: { $nin: [parcel_interface_1.PARCEL_STATUS.CANCELED, parcel_interface_1.PARCEL_STATUS.REQUESTED] } }).sort({ createdAt: -1 });
    const totalParcel = yield parcel_model_1.Parcel.countDocuments({ receiver: receiverId, status: { $nin: [parcel_interface_1.PARCEL_STATUS.CANCELED, parcel_interface_1.PARCEL_STATUS.REQUESTED] } });
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    };
});
const getDeliveryHistory = (receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcels = yield parcel_model_1.Parcel.find({ receiver: receiverId, status: parcel_interface_1.PARCEL_STATUS.DELIVERED }).sort({ updateAt: -1 });
    const totalParcel = yield parcel_model_1.Parcel.countDocuments({ receiver: receiverId, status: parcel_interface_1.PARCEL_STATUS.DELIVERED });
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    };
});
const confirmDelivery = (parcelId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findOne({ _id: parcelId, receiver: receiverId });
    if (!parcel) {
        throw new AppError_1.default(401, "Delivery parcel not found or you are not authorized");
    }
    if (parcel.status !== parcel_interface_1.PARCEL_STATUS.IN_TRANSIT) {
        throw new AppError_1.default(401, "Parcel is not ready to be delivered");
    }
    parcel.status = parcel_interface_1.PARCEL_STATUS.DELIVERED;
    parcel.statusLogs.push({
        status: parcel_interface_1.PARCEL_STATUS.DELIVERED,
        note: "Parcel delivered by receiver",
        updatedBy: new mongoose_1.Types.ObjectId(receiverId)
    });
    yield parcel.save();
    return parcel;
});
// Admin
const getAllParcels = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {};
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.sender) {
        query.sender = filters.sender;
    }
    if (filters.receiver) {
        query.receiver = filters.receiver;
    }
    const parcels = yield parcel_model_1.Parcel.find(query)
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .sort({ createdAt: -1 });
    const totalParcel = yield parcel_model_1.Parcel.countDocuments(query);
    return {
        data: parcels,
        meta: {
            total: totalParcel
        }
    };
});
const updateParcelStatus = (parcelId, newStatus, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(401, "Parcel not found");
    }
    const currentStatus = parcel.status;
    const validTransitions = {
        [parcel_interface_1.PARCEL_STATUS.REQUESTED]: [parcel_interface_1.PARCEL_STATUS.APPROVED],
        [parcel_interface_1.PARCEL_STATUS.APPROVED]: [parcel_interface_1.PARCEL_STATUS.DISPATCHED],
        [parcel_interface_1.PARCEL_STATUS.DISPATCHED]: [parcel_interface_1.PARCEL_STATUS.IN_TRANSIT],
        [parcel_interface_1.PARCEL_STATUS.IN_TRANSIT]: [parcel_interface_1.PARCEL_STATUS.DELIVERED],
        [parcel_interface_1.PARCEL_STATUS.DELIVERED]: [],
        [parcel_interface_1.PARCEL_STATUS.CANCELED]: [],
        [parcel_interface_1.PARCEL_STATUS.BLOCKED]: [],
        [parcel_interface_1.PARCEL_STATUS.UNBLOCKED]: []
    };
    if (!((_a = validTransitions[currentStatus]) === null || _a === void 0 ? void 0 : _a.includes(newStatus))) {
        throw new AppError_1.default(401, `Cannot update parcel status ${currentStatus} to ${newStatus}`);
    }
    parcel.status = newStatus;
    parcel.statusLogs.push({
        status: newStatus,
        note: "Update by Admin",
        updatedBy: new mongoose_1.Types.ObjectId(adminId)
    });
    yield parcel.save();
    return parcel;
});
const blockParcel = (parcelId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(401, "Parcel not found");
    }
    parcel.isBlocked = !parcel.isBlocked;
    parcel.statusLogs.push({
        status: parcel.isBlocked ? parcel_interface_1.PARCEL_STATUS.BLOCKED : parcel_interface_1.PARCEL_STATUS.APPROVED,
        note: `Parcel ${parcel.isBlocked ? parcel_interface_1.PARCEL_STATUS.BLOCKED : parcel_interface_1.PARCEL_STATUS.UNBLOCKED} by Admin`,
        updatedBy: new mongoose_1.Types.ObjectId(adminId)
    });
    yield parcel.save();
    return parcel;
});
const getTrackingParcel = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId })
        .populate("sender", "name email phone")
        .populate("receiver", "name email phone");
    if (!parcel) {
        throw new AppError_1.default(401, "Parcel not found with this tracking ID");
    }
    parcel.isBlocked = !parcel.isBlocked;
    return {
        trackingId: parcel.trackingId,
        status: parcel.status,
        deliveryAddress: parcel.deliveryAddress,
        pickupAddress: parcel.pickupAddress,
        fee: parcel.fee,
        sender: parcel.sender,
        receiver: parcel.receiver,
        statusLogs: parcel.statusLogs
    };
});
exports.ParcelService = {
    createParcel,
    getAllParcel,
    getParcelStatusLog,
    cancelParcel,
    getIncomingParcels,
    getDeliveryHistory,
    confirmDelivery,
    getAllParcels,
    updateParcelStatus,
    blockParcel,
    getTrackingParcel
};
