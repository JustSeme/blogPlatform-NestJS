import {
    IsUrl, Length
} from "class-validator"
import { Transform } from "class-transformer"

export class BlogInputModel {
    @Transform(({ value }) => value.trim())
    @Length(3, 15)
    name: string

    @Length(3, 500)
    description: string

    @IsUrl()
    @Length(3, 100)
    websiteUrl: string
}