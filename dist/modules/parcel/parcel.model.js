"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = exports.StatusLog = void 0;
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
const statusLogShema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.PARCEL_STATUS),
        default: parcel_interface_1.PARCEL_STATUS.REQUESTED
    },
    location: { type: String },
    note: { type: String },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false
});
exports.StatusLog = (0, mongoose_1.model)("StatusLog", statusLogShema);
const parcelShema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    type: { type: String },
    weight: { type: Number },
    fee: { type: Number },
    trackingId: { type: String, required: true, unique: true },
    description: { type: String },
    pickupAddress: { type: String },
    deliveryAddress: { type: String },
    status: {
        type: String,
        enum: Object.values(parcel_interface_1.PARCEL_STATUS),
        default: parcel_interface_1.PARCEL_STATUS.REQUESTED
    },
    statusLogs: [statusLogShema],
    isBlocked: { type: Boolean, default: false },
    deliveryDate: Date
}, {
    timestamps: true,
    versionKey: false
});
exports.Parcel = (0, mongoose_1.model)("Parcel", parcelShema);
