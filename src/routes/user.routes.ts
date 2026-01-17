import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../middlewares/jwt.ts";
import { updatePasswordSchema, updateUserSchema, type UpdateUserData, type UpdateUserPasswordData } from "../schemas/user.schema.ts";
import { formatZodError } from "../lib/zod.ts";
import { prisma } from "../lib/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { upload } from "../middlewares/multer.ts";
import { fileURLToPath } from "url";
import path from "path";
import fs, { mkdir, unlink } from "fs/promises";
import { generateHash, passwordCheck } from "../lib/bcrypt.ts";
import { userSerializer } from "../serializers/user.ts";

export const userRoutes = Router()
userRoutes.use(authMiddleware)

userRoutes.get('/me', async (req: Request, res: Response) => {
    return res.json({
        user: req.user
    })
})


userRoutes.put("/update", upload.single("avatar"), async (req: Request, res: Response) => {
    const parsed = updateUserSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Erro na validação',
            detail: formatZodError(parsed.error)
        })
    }
    const data = parsed.data
    const payload: Partial<UpdateUserData> = {}
    if (data.email) payload.email = data.email
    if (data.name) payload.name = data.name
    if (data.birthday) payload.birthday = data.birthday
    if (data.username) payload.username = data.username
    payload.updatedAt = new Date()

    // Verificar se existe usuário com o mesmo email
    if (data.email) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: data.email
            }
        })

        if (existingUser && existingUser.email != req.user?.email) {
            return res.status(400).json({
                message: "Já existe um usuário cadastrado para esse email"
            })
        }
    }

    if (req.file !== undefined) {
        const { mimetype, size, buffer } = req.file
        const maxBytes = 5 * 1024 * 1024

        if (!mimetype.startsWith("image/") || size > maxBytes) {
            return res.status(400).json({
                message: "formato de arquivo inválido",
                detail: "avatar: o arquivo deve ser uma imagem de no máximo 5mb"
            })
        }

        const mimeExt = mimetype.split("/")[1]
        const ext = mimeExt === "jpeg" ? "jpg" : mimeExt?.replace(/[^a-z0-9]/gi, '')

        const uuid = crypto.randomUUID()
        const filename = `${uuid}.${ext}`

        const __filnename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filnename)

        const avatarsDirs = path.join(__dirname, '..', 'static', 'images', 'avatars');
        const savePath = path.join(avatarsDirs, filename)

        await mkdir(avatarsDirs, { recursive: true })
        await fs.writeFile(savePath, buffer)

        const prevAvatarUrl = req.user?.avatar as string
        const prevAvatarFileName = path.basename(prevAvatarUrl)
        const prevAvatarPath = path.join(__dirname, '..', 'static', 'images', 'avatars', prevAvatarFileName)

        if (prevAvatarUrl && prevAvatarUrl !== "/static/images/avatars/default.png") {
            try {
                await unlink(prevAvatarPath);
                // opcional: console.log('Avatar anterior apagado:', prevAvatarPath);
            } catch (err: any) {
                // se não existir, ignora; senão, loga o erro
                if (err.code === 'ENOENT') {
                    // já foi removido ou nunca existiu — sem problema
                } else {
                    console.error('Erro ao deletar avatar anterior:', err);
                    // não interromper a resposta ao usuário por causa de erro ao deletar arquivo antigo,
                    // mas você pode optar por enviar um warning no log/DB.
                }
            }
        }

        payload.avatar = `/static/images/avatars/${filename}`
    }

    try {
        const userUpdated = await prisma.user.update({
            where: {
                id: req.user?.id as number
            },
            data: payload
        })

        const userSerialized = userSerializer(userUpdated)

        return res.json({
            user: userSerialized
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


userRoutes.put("/update-password", async (req: Request, res: Response) => {
    const parsed = updatePasswordSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            message: "erro na validação",
            detail: formatZodError(parsed.error)
        })
    }

    const data = parsed.data

    const user = await prisma.user.findFirst({
        where: { id: req.user?.id as number }
    })

    const passwordMatch = await passwordCheck(data.currentPassword, user?.password as string)

    if (!passwordMatch) return res.status(400).json({
        message: "Senha atual incorreta",
    })

    const payload: UpdateUserPasswordData = {
        password: await generateHash(data.password),
        passwordUpdatedAt: new Date()
    }

    try {
        await prisma.user.update({
            where: { id: req.user?.id as number },
            data: payload
        })

        return res.status(200).json({
            message: "Senha alterada com sucesso.",
        });
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
