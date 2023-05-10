import {
    IsBoolean, Length, Validate
} from "class-validator"
import { TrimIfString } from "../../../general/decorators/trimIfString.decorator"
import { IsBlogByIdExist } from "../../../general/decorators/isBlogExists.validation.decorator"

export class BanUserForBlogInputModel {
    @IsBoolean()
    isBanned: boolean

    @TrimIfString()
    @Length(20, 1000)
    banReason: string

    @Validate(IsBlogByIdExist)
    blogId: string
}