import { BadRequestException } from "@nestjs/common"
import { Transform } from "class-transformer"
import { generateErrorsMessages } from "../helpers/helpers"

export function SortDirectionToUpperCase() {
    return Transform(({ value }) => {
        if (value.toLocaleLowerCase() === 'asc' || value.toLocaleLowerCase() === 'desc') {
            return value.toUpperCase()
        }
        throw new BadRequestException(generateErrorsMessages('Make sure your sort direction is correct', 'sortDirection'))
    })
}