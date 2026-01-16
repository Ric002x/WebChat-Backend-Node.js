import { Router, type Request, type Response } from "express";
import { loginSchema, registerSchema, type RegisterData } from "../schemas/auth.schema.ts";
import { formatZodError } from "../lib/zod.ts";
import { prisma } from "../lib/prisma.ts";
import { generateHash, passwordCheck } from "../lib/bcrypt.ts";
import { ReturnUser } from "../types/User.ts";
import { generateAccessToken } from "../middlewares/jwt.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { randomUUID } from "crypto";

export const authRoutes = Router()

authRoutes.post("/register", async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Erro na validação',
            detail: formatZodError(parsed.error)
        })
    }
    const data = parsed.data

    const existingUser = await prisma.user.findFirst({
        where: { email: data.email }
    })

    if (existingUser) {
        return res.status(400).json({
            message: "Já existe um usuário cadastrado para esse email"
        })
    }

    const passwordHash = await generateHash(data.password)

    const payload: RegisterData = {
        name: data.name,
        email: data.email,
        password: passwordHash,
        username: `user${randomUUID().slice(0, 10)}`
    }

    try {
        const user = await prisma.user.create({
            data: payload,
            select: ReturnUser
        })

        const accessToken = generateAccessToken({ id: user.id })
        return res.status(201).json({
            user: user,
            accessToken: accessToken
        })

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2014') {
                return res.status(500).json({
                    message: "erro ao criar usuário",
                    detail: error.message
                })
            }
        } else {
            return res.status(500).json({
                message: "Ocorreu um erro inesperado"
            })
        }
    }
})


authRoutes.post("/login", async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Erro na validação',
            detail: formatZodError(parsed.error)
        })
    }
    const data = parsed.data

    const user = await prisma.user.findFirst({
        where: { email: data.email }
    })
    if (!user) {
        return res.status(400).json({
            message: "Email ou senha incorretos"
        })
    }

    const passwordMatch = await passwordCheck(data.password, user.password)
    if (!passwordMatch) {
        return res.status(400).json({
            message: "Email ou senha incorretos"
        })
    }

    const { password, ...userWithoutPassword } = user;
    const accessToken = generateAccessToken({ id: user.id })

    try {
        return res.send({
            user: userWithoutPassword,
            accessToken: accessToken,
        })

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2014') {
                return res.status(500).json({
                    message: "erro ao criar usuário",
                    detail: error.message
                })
            }
        } else {
            return res.status(500).json({
                message: "Ocorreu um erro inesperado"
            })
        }
    }
})