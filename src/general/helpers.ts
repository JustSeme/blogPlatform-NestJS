export function generateErrorsMessages(message: string, field: string) {
    return [{
        message,
        field
    }]
}

export const funcSleep = (delay: number) => {
    return new Promise((resolve) => setTimeout(resolve, delay))
}