import {
    Length, Validate
} from "class-validator"
import { IsBlogByIdExist } from "src/general/decorators/isBlogExists.validation.decorator"
import { TrimIfString } from "src/general/decorators/trimIfString.decorator"

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