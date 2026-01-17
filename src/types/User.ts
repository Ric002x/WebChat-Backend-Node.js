export type User = {
    id: number,
    avatar: string,
    email: string,
    name: string,
    username: string,
    birthday: Date | null,
    createdAt: Date,
    updatedAt: Date | null,
    lastAccess: Date,
    passwordUpdatedAt: Date | null,
    role: string
}

export type UserSerialized = {
    id: number,
    name: string,
    email: string,
    username: string,
    avatar: string,
    lastAccess: Date
}
