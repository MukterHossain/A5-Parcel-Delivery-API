"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const parcel_route_1 = require("../modules/parcel/parcel.route");
const otp_route_1 = require("../modules/otp/otp.route");
exports.router = (0, express_1.Router)();
const moduleRouters = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/parcels",
        route: parcel_route_1.ParcelRoutes
    },
    {
        path: "/otp",
        route: otp_route_1.OtpRoutes
    },
];
moduleRouters.forEach((route) => {
    exports.router.use(route.path, route.route);
});
