import { prisma } from "../../lib/prisma.ts"
import { ReturnSimpleUser } from "../../types/User.ts"

export const getUser = async (username: string) => {
    const user = await prisma.user.findUnique({
        where: { username },
        select: ReturnSimpleUser
    })

    if (user) return user
    return null
}

export const hasExistingChat = async (userOneId: number, userTwoId: number) => {
    const chat = await prisma.chat.findFirst({
        where: {
            OR: [
                {
                    userOneId: userOneId,
                    userTwoId: userTwoId
                },
                {
                    userTwoId: userOneId,
                    userOneId: userTwoId
                }
            ],
            deletedAt: null
        }
    })

    if (chat) return chat
    return null
}

export const chatBelongsToUser = async (chatId: number, userId: number) => {
    const chat = await prisma.chat.findFirst({
        where: {
            OR: [
                {
                    userOneId: userId,
                },
                {
                    userTwoId: userId,
                }
            ],
            id: chatId,
            deletedAt: null
        }
    })

    if (chat) return chat
    return null
}

export const markMessagesAsSeen = async (chatId: number, userId: number) => {
    await prisma.chatMessage.updateMany({
        where: {
            chatId,
            viewedAt: null,
            deletedAt: null,
            NOT: { userId }
        },
        data: { viewedAt: new Date() }
    })
}