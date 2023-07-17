import { Type } from "class-transformer"
import {
    ArrayMinSize,
    IsArray, Length
} from "class-validator"

export class QuestionInputModel {
    @Length(10, 500)
    body: string

    @IsArray()
    @ArrayMinSize(1)
    @Type(() => String)
    correctAnswers: Array<string>
}