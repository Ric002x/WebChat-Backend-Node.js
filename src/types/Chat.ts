import type { User, UserSerialized } from "./User.ts";

export type Chat = {
    id: number,
    createdAt: Date,
    deletedAt: Date | null,
    viewedAt: Date | null,
    userOneId: number,
    userOne: User,
    userTwoId: number,
    userTwo: User,
}

export type ChatSerialized = {
    id: number,
    lastMessage: ChatMessageSerialized | null,
    unseenCount: number | null,
    user: UserSerialized,
    viewedAt: Date | null,
    createdAt: Date
}

export type ChatMessage = {
    id: number,
    chatId: number,
    userId: number,
    user: User,
    body: string,
    createdAt: Date,
    deletedAt: Date | null,
    updatedAt: Date | null,
    viewedAt: Date | null,
}

export type ChatMessageSerialized = {
    id: number,
    body: string,
    user: UserSerialized,
    createdAt: Date,
    viewedAt: Date | null,
}


