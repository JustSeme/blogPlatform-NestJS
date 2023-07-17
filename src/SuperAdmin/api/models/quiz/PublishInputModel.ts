import { IsBoolean } from "class-validator"

export class PublishQuestionInputModel {
    @IsBoolean()
    published: boolean
}