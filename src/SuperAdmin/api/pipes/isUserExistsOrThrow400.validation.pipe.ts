import {
    BadRequestException,
    Injectable, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { UsersRepository } from "../../../general/users/infrastructure/users-db-repository"

@Injectable()
export class IsUserExistOrThrow400Pipe implements PipeTransform {
    constructor(private usersRepository: UsersRepository) { }

    async transform(userId: string): Promise<string> {
        if (!(await this.usersRepository.isUserExists(userId))) {
            throw new BadRequestException(generateErrorsMessages('blog by userId parameter is not exists', 'userId'))
        }
        return userId
    }

}