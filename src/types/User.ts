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

export const ReturnUser = {
    id: true,
    avatar: true,
    email: true,
    name: true,
    username: true,
    birthday: true,
    createdAt: true,
    updatedAt: true,
    lastAccess: true,
    passwordUpdatedAt: true,
    role: true
}

