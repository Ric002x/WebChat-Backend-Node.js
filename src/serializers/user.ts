import type { User } from "../types/User.ts";

export const userSerializer = (user: User) => {
    const CURRENT_URL = process.env.CURRENT_URL || "http://localhost:5000"

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: CURRENT_URL + user.avatar,
        lastAccess: user.lastAccess
    };
}