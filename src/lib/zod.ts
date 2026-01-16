import { ZodError } from "zod"

export function formatZodError(error: ZodError) {
    const fieldErrors: Record<string, string[]> = {}

    for (const issue of error.issues) {
        const field = issue.path.join('.') || 'root'

        if (!fieldErrors[field]) {
            fieldErrors[field] = []
        }

        fieldErrors[field].push(issue.message)
    }

    return {
        error: 'VALIDATION_ERROR',
        fields: fieldErrors
    }
}
