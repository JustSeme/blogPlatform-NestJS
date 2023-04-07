import {
    IsUrl, Length
} from "class-validator"

export class BlogInputModel {
    @Length(3, 15)
    name: string

    @Length(10, 500)
    description: string

    @IsUrl()
    @Length(3, 100)
    websiteUrl: string
}