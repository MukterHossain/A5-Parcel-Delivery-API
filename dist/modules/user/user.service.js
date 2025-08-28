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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_interface_1 = require("./user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("./user.model");
const AppError_1 = __importDefault(require("../../errorHandler/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = payload, rest = __rest(payload, ["email", "password", "role"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User already exist");
    }
    if (role === user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Admin already exist!");
    }
    if (role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Super Admin already exist!");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const authProvider = { provider: "credential", providerId: email };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashedPassword, auths: [authProvider], role }, rest));
    return user;
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not Found");
    }
    if (decodedToken.role === user_interface_1.Role.ADMIN && ifUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(401, "You are not authorized");
    }
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.SENDER || decodedToken.role === user_interface_1.Role.RECEIVER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
        if (payload.role === user_interface_1.Role.SUPER_ADMIN && decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVarified) {
        if (decodedToken.role === user_interface_1.Role.SENDER || decodedToken.role === user_interface_1.Role.RECEIVER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, env_1.envVars.BCRYPT_SALT_ROUND);
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return newUpdatedUser;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    return {
        data: user
    };
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find();
    const totalUsers = yield user_model_1.User.countDocuments();
    return {
        data: users,
        meta: {
            total: totalUsers
        }
    };
});
const getAllReceivers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({ role: user_interface_1.Role.RECEIVER }).select("_id name email");
    return {
        data: users
    };
});
const blockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already blocked!");
    }
    if (user.role === user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Your not authorized to unblock this user");
    }
    if (user.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Your not authorized to unblock this user");
    }
    user.isActive = user_interface_1.IsActive.BLOCKED;
    yield user.save();
    return user;
});
const unblockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.isActive === user_interface_1.IsActive.ACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already active");
    }
    user.isActive = user_interface_1.IsActive.ACTIVE;
    yield user.save();
    return user;
});
const updateUserRole = (adminId, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    if (adminId === userId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot change your own role");
    }
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (role === user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Admin already exists.");
    }
    user.role = role;
    yield user.save();
    return user;
});
exports.UserService = {
    createUser,
    getAllUsers,
    getAllReceivers,
    getMe,
    updateUser,
    blockUser,
    unblockUser,
    updateUserRole
};
