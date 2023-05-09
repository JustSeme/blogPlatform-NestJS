import { IsBoolean } from "class-validator"

export class BanBlogInputModel {
    @IsBoolean()
    isBanned: boolean
}