import * as fs from 'fs/promises'


export function generateErrorsMessages(message: string, field: string) {
    return [{
        message,
        field
    }]
}

export const funcSleep = (delay: number) => {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export const writeInFile = async (filePath: string, text: string) => {
    await fs.writeFile(filePath, text)
}