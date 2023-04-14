import {
    Length, Validate
} from "class-validator"
import { TrimIfString } from "../../../general/decorators/trimIfString.decorator"
import { IsBlogByIdExist } from "../../../general/decorators/isBlogExists.validation.decorator"

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