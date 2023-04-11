import { Transform } from "class-transformer"
import {
    Length, Validate
} from "class-validator"
import { IsBlogByIdExist } from "src/decorators/is-blogById-exists.pipe.decorator"

export class PostInputModel {
    @Transform(({ value }) => value.trim())
    @Length(3, 30)
    title: string

    @Transform(({ value }) => value.trim())
    @Length(3, 100)
    shortDescription: string

    @Transform(({ value }) => value.trim())
    @Length(3, 1000)
    content: string

    @Validate(IsBlogByIdExist)
    blogId: string
}