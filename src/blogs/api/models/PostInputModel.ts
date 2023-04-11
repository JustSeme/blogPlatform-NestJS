import { Transform } from "class-transformer"
import { Length } from "class-validator"

export class PostInputModel {
    @Transform(({ value }) => value.trim())
    @Length(3, 30)
    title: string

    @Transform(({ value }) => value.trim())
    @Length(3, 100)
    shortDescription: string

    @Transform(({ value }) => value.trim())
    @Length(100, 1000)
    content: string
    blogId: string
}