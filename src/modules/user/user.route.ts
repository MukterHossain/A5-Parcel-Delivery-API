import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";


const router = Router()




router.post("/register", validateRequest(createUserZodSchema), UserController.createUser)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.getAllUsers)
router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe)
router.patch("/:id", validateRequest(updateUserZodSchema),  checkAuth(...Object.values(Role)), UserController.updateUser)
router.patch("/block/:id", validateRequest(updateUserZodSchema),  checkAuth(Role.ADMIN,), UserController.blockUser)
router.patch("/unblock/:id", validateRequest(updateUserZodSchema),  checkAuth(Role.ADMIN,), UserController.unblockUser)
router.patch("/update-role/:id", validateRequest(updateUserZodSchema),  checkAuth(Role.ADMIN,), UserController.updateUserRole)



export const UserRoutes = router