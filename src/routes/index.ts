import { Router } from "express";
import { authRoutes } from "./auth.routes.ts";
import { userRoutes } from "./user.routes.ts";
import { chatRoutes } from "./chat.routes.ts";
import { chatMessageRoutes } from "./chatMessage.routes.ts";

export const apiRouter = Router()

apiRouter.use("/auth", authRoutes)
apiRouter.use("/user", userRoutes)
apiRouter.use("/chat", chatRoutes)
apiRouter.use("/chat/message", chatMessageRoutes)