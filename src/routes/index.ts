import { Router } from "express";
import { authRoutes } from "./auth.routes.ts";
import { userRoutes } from "./user.routes.ts";

export const apiRouter = Router()

apiRouter.use("/auth", authRoutes)
apiRouter.use("user", userRoutes)