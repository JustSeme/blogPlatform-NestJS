import {
    Length, Validate
} from "class-validator"
import { IsBlogByIdExist } from "src/decorators/isBlogExists.validation.decorator"
import { TrimIfString } from "src/decorators/trimIfString.decorator"

export class PostInputModel {
    @TrimIfString()
    @Length(3, 30)
    title: string

    @TrimIfString()
    @Length(3, 100)
    shortDescription: string

    @TrimIfString()
    @Length(3, 1000)
    content: string

    @Validate(IsBlogByIdExist)
    blogId: string
}