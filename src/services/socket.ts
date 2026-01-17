import { prisma } from "../lib/prisma.ts";
import { getIO } from "../lib/socket.ts";

const socket = getIO()

socket.on("updateMessageAsSeen", async (data: { chatId: number, excludeUserId: number }) => {
    const chatId = data.chatId

    const chat = await prisma.chat.findFirst({
        where: { id: chatId },
        select: {
            userOneId: true,
            userTwoId: true
        }
    })

    await prisma.chatMessage.updateMany({
        where: {
            chatId,
            viewedAt: null
        },
        data: { viewedAt: new Date() }
    })

    socket.emit("updateChat", {
        query: {
            users: [chat?.userOneId, chat?.userTwoId]
        }
    })

    socket.emit("markMessagesAsSeen", {
        query: {
            chatId,
            excludeUserId: data.excludeUserId
        }
    })
})