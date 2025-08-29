"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = __importStar(require("mongoose"));
const getTrackingId_1 = require("../../utils/getTrackingId");
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = require("./parcel.model");
const AppError_1 = __importDefault(require("../../errorHandler/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../user/user.model");
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
const getAllParcels = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = {};
    if (query.status) {
        filters.status = query.status;
    }
    if (query.type) {
        filters.type = query.type;
    }
    if (query.sender) {
        filters.sender = query.sender;
    }
    if (query.receiver) {
        filters.receiver = query.receiver;
    }
    if (query.isBlocked !== undefined) {
        filters.isBlocked = query.isBlocked = "true";
    }
    if (query.searchTerm) {
        const searchRegex = new RegExp(query.searchTerm, "i");
        filters.$or = [
            { trackingId: { $regex: searchRegex } },
            { pickupAddress: { $regex: searchRegex } },
            { deliveryAddress: { $regex: searchRegex } },
            { type: { $regex: searchRegex } },
        ];
    }
    const sort = query.sort || "-createdAt";
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const parcels = yield parcel_model_1.Parcel.find(filters)
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .sort(sort).skip(skip).limit(limit);
    const totalParcel = yield parcel_model_1.Parcel.countDocuments(filters);
    return {
        data: parcels,
        meta: {
            total: totalParcel,
            page,
            limit,
            totalPages: Math.ceil(totalParcel / limit)
        }
    };
});
const getAnalytics = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsers = yield user_model_1.User.countDocuments();
    const totalSenders = yield user_model_1.User.countDocuments({ role: "SENDER" });
    const totalReceivers = yield user_model_1.User.countDocuments({ role: "RECEIVER" });
    const totalParcel = yield parcel_model_1.Parcel.countDocuments();
    const parcelsStatusCount = yield parcel_model_1.Parcel.aggregate([
        { $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    status: "$status"
                },
                count: { $sum: 1 }
            } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    return {
        totalUsers,
        totalSenders,
        totalReceivers,
        totalParcel,
        parcelsStatusCount
    };
});
const getSenderAnalytics = (query, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const totalPacelSent = yield parcel_model_1.Parcel.countDocuments({ sender: senderId });
    const deliveredParcels = yield parcel_model_1.Parcel.countDocuments({ sender: senderId, status: parcel_interface_1.PARCEL_STATUS.DELIVERED });
    const intransitParcels = yield parcel_model_1.Parcel.countDocuments({ sender: senderId, status: parcel_interface_1.PARCEL_STATUS.IN_TRANSIT });
    const canceledParcel = yield parcel_model_1.Parcel.countDocuments({ sender: senderId, status: parcel_interface_1.PARCEL_STATUS.CANCELED });
    const monthlyPacelStats = yield parcel_model_1.Parcel.aggregate([
        { $match: { sender: new mongoose_1.default.Types.ObjectId(senderId) } },
        { $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
                count: { $sum: 1 }
            } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    return {
        totalPacelSent,
        deliveredParcels,
        intransitParcels,
        canceledParcel,
        monthlyPacelStats
    };
});
const getReceiverAnalytics = (query, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    // const objectId = new ObjectId(String(payload.userId));
    const totalPacelReceived = yield parcel_model_1.Parcel.countDocuments({ receiver: receiverId });
    const deliveredParcels = yield parcel_model_1.Parcel.countDocuments({ receiver: receiverId, status: parcel_interface_1.PARCEL_STATUS.DELIVERED });
    const intransitParcels = yield parcel_model_1.Parcel.countDocuments({ receiver: receiverId, status: parcel_interface_1.PARCEL_STATUS.IN_TRANSIT });
    const canceledParcel = yield parcel_model_1.Parcel.countDocuments({ receiver: receiverId, status: parcel_interface_1.PARCEL_STATUS.CANCELED });
    const monthlyPacelStats = yield parcel_model_1.Parcel.aggregate([
        { $match: { receiver: new mongoose_1.default.Types.ObjectId(receiverId) } },
        { $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
                delivered: { $sum: { $cond: [{ $eq: ["$status", parcel_interface_1.PARCEL_STATUS.DELIVERED] }, 1, 0] } },
                intransit: { $sum: { $cond: [{ $eq: ["$status", parcel_interface_1.PARCEL_STATUS.IN_TRANSIT] }, 1, 0] } },
                canceled: { $sum: { $cond: [{ $eq: ["$status", parcel_interface_1.PARCEL_STATUS.CANCELED] }, 1, 0] } },
                total: { $sum: 1 }
            } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    return {
        totalPacelReceived,
        deliveredParcels,
        intransitParcels,
        canceledParcel,
        monthlyPacelStats
    };
});
const updateParcelStatus = (parcelId, status, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("updateParcelStatus", parcelId, status, adminId);
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(401, "Parcel not found");
    }
    const currentStatus = parcel.status;
    const validTransitions = {
        [parcel_interface_1.PARCEL_STATUS.REQUESTED]: [parcel_interface_1.PARCEL_STATUS.APPROVED, parcel_interface_1.PARCEL_STATUS.CANCELED, parcel_interface_1.PARCEL_STATUS.BLOCKED, parcel_interface_1.PARCEL_STATUS.UNBLOCKED],
        [parcel_interface_1.PARCEL_STATUS.APPROVED]: [parcel_interface_1.PARCEL_STATUS.DISPATCHED],
        [parcel_interface_1.PARCEL_STATUS.DISPATCHED]: [parcel_interface_1.PARCEL_STATUS.IN_TRANSIT],
        [parcel_interface_1.PARCEL_STATUS.IN_TRANSIT]: [],
        [parcel_interface_1.PARCEL_STATUS.DELIVERED]: [],
        [parcel_interface_1.PARCEL_STATUS.CANCELED]: [],
        [parcel_interface_1.PARCEL_STATUS.BLOCKED]: [parcel_interface_1.PARCEL_STATUS.UNBLOCKED],
        [parcel_interface_1.PARCEL_STATUS.UNBLOCKED]: [parcel_interface_1.PARCEL_STATUS.BLOCKED, parcel_interface_1.PARCEL_STATUS.APPROVED],
    };
    if (!((_a = validTransitions[currentStatus]) === null || _a === void 0 ? void 0 : _a.includes(status))) {
        throw new AppError_1.default(401, `Cannot update parcel status ${currentStatus} to ${status}`);
    }
    parcel.status = status;
    parcel.statusLogs.push({
        status: status,
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
    if (parcel.status === "DELIVERED" || parcel.status === "CANCELED") {
        throw new AppError_1.default(401, "Delivered or canceled parcels cannot be blocked");
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
    // parcel.isBlocked = !parcel.isBlocked;
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
const getPublicTrackingParcel = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId })
        .select("trackingId status deliveryAddress pickupAddress fee sender receiver statusLogs");
    if (!parcel) {
        throw new AppError_1.default(401, "Parcel not found with this tracking ID");
    }
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
    getAnalytics,
    getSenderAnalytics,
    getReceiverAnalytics,
    updateParcelStatus,
    blockParcel,
    getTrackingParcel,
    getPublicTrackingParcel
};
