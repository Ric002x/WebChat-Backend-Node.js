import { prisma } from "../lib/prisma.ts";
import type { Chat, ChatMessage, ChatMessageSerialized, ChatSerialized } from "../types/Chat.ts";
import { userSerializer } from "./user.ts";


export const ChatMessageSerializerRaw = (chatMessage: ChatMessage): ChatMessageSerialized => {
    return {
        id: chatMessage.id,
        body: chatMessage.body,
        user: userSerializer(chatMessage.user),
        viewedAt: chatMessage.viewedAt,
        createdAt: chatMessage.createdAt
    }
}

export const ChatMessageSerializer = async (data: any, { many = false }: { many: boolean }): Promise<ChatMessageSerialized | ChatMessageSerialized[] | null> => {
    if (many && Array.isArray(data)) {

        const serializedMessages = await Promise.all(
            data.map(message => ChatMessageSerializerRaw(message))
        )
        return serializedMessages.filter((message): message is ChatMessageSerialized => message !== null);

    } else if (!many && typeof data === "object") {

        const serializedMessage = ChatMessageSerializerRaw(data)
        return serializedMessage

    } else {
        throw new Error('ChatSerializer: expected Chat when many=false');
    }
}


export const ChatSerializerRaw = async (chat: Chat, reqUserId: number): Promise<ChatSerialized | null> => {
    // Pegar usuário
    function getUser() {
        if (chat.userOne.id === reqUserId) {
            return chat.userTwo
        }

        return chat.userOne
    }

    // Pegar qty de mensagens não visualizadas
    async function getUnseenCount() {
        let unseenCount = await prisma.chatMessage.count({
            where: {
                chatId: chat.id,
                viewedAt: null,
                deletedAt: null,
                NOT: {
                    userId: reqUserId
                }
            }
        })

        if (unseenCount) return unseenCount
        return null
    }

    // Pegar última message
    async function getLastMessage() {
        let lastMessage = await prisma.chatMessage.findFirst({
            where: {
                chatId: chat.id,
                deletedAt: null
            },
            orderBy: { createdAt: "desc" },
            include: { user: true }
        })


        if (lastMessage) {
            const serialized = ChatMessageSerializerRaw(lastMessage)
            return serialized
        }
        return null
    }

    const toUser = userSerializer(getUser())
    const unseenCount = await getUnseenCount()
    const lastMessage = await getLastMessage()

    return {
        id: chat.id,
        lastMessage,
        unseenCount,
        user: toUser,
        createdAt: chat.createdAt,
        viewedAt: chat.viewedAt
    }
}


export const ChatSerializer = async (data: any, reqUserId: number, { many = false }: { many: boolean }): Promise<ChatSerialized | ChatSerialized[] | null> => {
    if (many && Array.isArray(data)) {

        const serializedChats = await Promise.all(
            data.map(chat => ChatSerializerRaw(chat, reqUserId))
        )
        return serializedChats.filter((chat): chat is ChatSerialized => chat !== null);

    } else if (!many && typeof data === "object") {

        const chat = await ChatSerializerRaw(data, reqUserId)
        return chat

    } else {
        throw new Error('ChatSerializer: expected Chat when many=false');
    }
}
