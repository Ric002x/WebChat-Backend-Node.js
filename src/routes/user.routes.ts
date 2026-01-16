import { Router } from "express";
import { authMiddleware } from "../middlewares/jwt.ts";

export const userRoutes = Router()
userRoutes.use(authMiddleware)