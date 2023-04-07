import { Length } from "class-validator"

export class CommentInputModel {
    @Length(20, 300)
    content: string
}