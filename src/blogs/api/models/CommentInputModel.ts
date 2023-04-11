import { Transform } from "class-transformer"
import { Length } from "class-validator"

export class CommentInputModel {
    @Transform(({ value }) => value.trim())
    @Length(20, 300)
    content: string
}