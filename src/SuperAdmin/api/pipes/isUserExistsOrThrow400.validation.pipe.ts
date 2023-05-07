import {
    BadRequestException,
    Injectable, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { UsersRepository } from "../../infrastructure/users-db-repository"

@Injectable()
export class IsUserExistOrThrow400Pipe implements PipeTransform {
    constructor(private usersRepository: UsersRepository) { }

    async transform(userId: string): Promise<string> {
        if (!(await this.usersRepository.isUserExists(userId))) {
            throw new BadRequestException(generateErrorsMessages('user by userId parameter is not exists', 'userId'))
        }
        return userId
    }

}