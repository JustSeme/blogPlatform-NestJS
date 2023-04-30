import {
    IsBoolean, Length
} from "class-validator"
import { TrimIfString } from "../../../general/decorators/trimIfString.decorator"

export class BanInputModel {
    @IsBoolean()
    isBanned: boolean

    @TrimIfString()
    @Length(3, 20)
    banReason: string
}