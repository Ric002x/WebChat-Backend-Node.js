import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma.ts"


const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "insecure"

export const generateAccessToken = (userId: { id: number }) => {
    return jwt.sign(
        userId,
        accessTokenSecret,
        { algorithm: "HS256", expiresIn: "30d" }
    )
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) return res.status(401).json({
        message: "Usuário não autenticado"
    })

    const [scheme, token] = authHeader.split(" ")

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            message: 'Token mal estruturado',
        });
    }

    try {
        const decoded = jwt.verify(token as string, accessTokenSecret) as { id: number };
        const user = await prisma.user.findFirst({
            where: { id: decoded.id },
            select: {
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
                role: true,
            }
        })

        if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

        req.user = user
        return next()
    } catch (err: any) {
        return res.status(401).json({
            message: "Token inválido ou Expirado"
        })
    }
}