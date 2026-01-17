import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middlewares/jwt.ts";
import { chatBelongsToUser, markMessagesAsSeen } from "./utils/chat.ts";
import { getIO } from "../lib/socket.ts";
import { prisma } from "../lib/prisma.ts";
import { ChatMessageSerializer } from "../serializers/chat.ts";

export const chatMessageRoutes = Router()
chatMessageRoutes.use(authMiddleware)

chatMessageRoutes.get("/:chatId", async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId)
    if (isNaN(chatId)) return res.status(400).json({
        message: "Valor de chatId inválido"
    })

    const chat = await chatBelongsToUser(chatId, req.user?.id as number)
    if (!chat) return res.status(404).json({
        message: "Chat não encontrado"
    })
    await markMessagesAsSeen(chatId, req.user?.id as number)

    const socket = getIO()
    socket.emit("mark_messages_as_seen", {
        query: {
            chatId,
            exclude_user_id: req.user?.id as number
        }
    })

    const perPage = 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * perPage

    const messages = await prisma.chatMessage.findMany({
        where: { chatId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: perPage,
        skip,
        include: { user: true }
    })

    socket.emit("updateChat", {
        query: {
            users: [chat?.userOneId, chat?.userTwoId]
        }
    })

    const chatMessagesSerialized = await ChatMessageSerializer(messages, { many: true })

    return res.json({
        page: page,
        messages: chatMessagesSerialized
    })
})

chatMessageRoutes.post("/:chatId", async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId)
    if (isNaN(chatId)) return res.status(400).json({
        message: "Valor de chatId inválido"
    })

    const body: string | null = req.body.body

    const chat = await chatBelongsToUser(chatId, req.user?.id as number)
    if (!chat) return res.status(404).json({
        message: "Chat não encontrado"
    })
    await markMessagesAsSeen(chatId, req.user?.id as number)

    if (!body) return res.status(400).json({
        message: "O corpo da mensagem está vazio"
    })

    const chatMessage = await prisma.chatMessage.create({
        data: {
            chatId,
            body,
            userId: req.user?.id as number
        },
        include: { user: true }
    })

    const serialized = await ChatMessageSerializer(chatMessage, { many: false })


    const socket = getIO()
    socket.emit("updateChatMessages", {
        type: "create",
        message: serialized,
        query: {
            chatId
        }
    })

    await prisma.chat.update({
        where: { id: chatId },
        data: { viewedAt: new Date() }
    })

    socket.emit("updateChat", {
        query: {
            users: [chat.userOneId, chat.userTwoId]
        }
    })

    return res.json({
        message: serialized
    })
})

chatMessageRoutes.delete("/:chatId/:messageId", async (req: Request, res: Response) => {
    const chatId = Number(req.params.chatId)
    const messageId = Number(req.params.messageId)
    if (isNaN(chatId) || isNaN(messageId)) return res.status(400).json({
        message: "Os valores de chatId e messageId podem estar inválido"
    })

    const chat = await chatBelongsToUser(chatId, req.user?.id as number)
    if (!chat) return res.status(404).json({
        message: "Chat não encontrado"
    })

    const messageDeleted = await prisma.chatMessage.update({
        where: {
            id: messageId,
            chatId,
            userId: req.user?.id as number,
            deletedAt: null
        },
        data: {
            deletedAt: new Date()
        }
    })

    if (messageDeleted) {
        const socket = getIO()
        socket.emit("updateChatMessage", {
            type: "deleted",
            query: {
                chatId,
                messageId
            }
        })

        socket.emit("updateChat", {
            query: {
                users: [chat.userOneId, chat.userTwoId]
            }
        })
    }

    return res.json({
        message: "mensagem deletada"
    })
})