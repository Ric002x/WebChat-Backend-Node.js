import * as z from "zod";


export const loginSchema = z.object({
    email: z.email({ error: "Campo obrigatório" }),
    password: z.string({ error: "Campo obrigatório" })
})

export const registerSchema = z.object({
    name: z.string({ error: "Campo obrigatório" })
        .min(5, { error: "Mínimo de 5 caracteres" })
        .max(50, { error: "Máximo de 50 caracteres" }),
    email: z.email({ error: "Campo obrigatório" }),
    password: z.string({ error: "Campo obrigatório" })
        .regex(/^(?=.*[A-Z])(?=.*\d).{8,}$/, { error: "A senha deve ter o mínimo de 8 caracteres, e conter ao menos um número e um caractere especial" }),
    confirmPassword: z.string({ error: "Campo obrigatório" })
}).refine((data) => {
    data.password === data.confirmPassword,
        { error: "As senha não coincidem" }
}).transform(({ confirmPassword, ...rest }) => rest);

export type RegisterData = z.infer<typeof registerSchema>

