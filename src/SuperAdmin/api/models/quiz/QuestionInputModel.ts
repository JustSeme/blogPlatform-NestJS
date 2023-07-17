import {
    IsArray, Length
} from "class-validator"

export class QuestionInputModel {
    @Length(10, 500)
    body: string

    @IsArray()
    correctAnswers: Array<string>
}