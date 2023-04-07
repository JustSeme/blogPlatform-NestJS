import { Length } from "class-validator"

export class PostInputModel {
    @Length(3, 30)
    title: string

    @Length(3, 100)
    shortDescription: string

    @Length(100, 1000)
    content: string
    blogId: string
}