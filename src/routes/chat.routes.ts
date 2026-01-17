import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middlewares/jwt.ts";
import { prisma } from "../lib/prisma.ts";
import { chatBelongsToUser, getUser, hasExistingChat } from "./utils/chat.ts";
import { getIO } from "../lib/socket.ts";

export const chatRoutes = Router();
chatRoutes.use(authMiddleware)

chatRoutes.get("/", async (req: Request, res: Response) => {
    const chats = await prisma.chat.findMany({
        where: {
            OR: [
                { userOneId: req.user?.id as number },
                { userTwoId: req.user?.id as number }
            ],
            deletedAt: null
        },
        orderBy: { viewedAt: "desc" }
    })

    return res.send({
        chats: chats
    })
})

chatRoutes.post("/:username", async (req: Request, res: Response) => {
    const username = String(req.params.username) || ""

    const user = await getUser(username)
    if (!user) return res.status(404).json({
        message: "Usuário não encontrado"
    })

    let chat = await hasExistingChat(req.user?.id as number, user.id)

    if (!chat) {
        chat = await prisma.chat.create({
            data: {
                userOneId: req.user?.id as number,
                userTwoId: user.id,
                viewedAt: new Date()
            }
        })

        const socket = getIO()
        socket.emit("updateChat", {
            query: {
                "users": [req.user?.id, user.id]
            }
        })

    }

    return res.json({
        chat
    })
})

chatRoutes.delete("/:chatId", async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId)
    if (isNaN(chatId)) return res.status(400).json({
        message: "Valor de chatId inválido"
    })

    const chat = await chatBelongsToUser(chatId, req.user?.id as number)
    if (!chat) return res.status(404).json({
        message: "Chat não encontrado"
    })

    const chatDeleted = await prisma.chat.update({
        where: { id: chat.id },
        data: {
            deletedAt: new Date()
        }
    })

    if (chatDeleted) {
        const socket = getIO()
        socket.emit("updateChat", {
            type: "delete",
            query: {
                chatId,
                users: [chat.userOneId, chat.userTwoId]
            }
        })
    }

    return res.json({
        message: "chat deletado com sucesso"
    })
})