"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastError = void 0;
const handleCastError = (err) => {
    return {
        statusCode: 400,
        message: "Invalid MongoDB ObjectId. Please valid Id"
    };
};
exports.handleCastError = handleCastError;
