"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackingId = void 0;
const getTrackingId = (counter) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `TRK-${date}-${String(counter).padStart(6, "0")}`;
};
exports.getTrackingId = getTrackingId;
