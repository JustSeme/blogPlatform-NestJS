import {
    NotFoundException,
    Injectable, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { UsersTypeORMRepository } from "../../infrastructure/typeORM/users-typeORM-repository"

@Injectable()
export class IsUserExistPipe implements PipeTransform {
    constructor(private usersRepository: UsersTypeORMRepository) { }

    async transform(userId: string): Promise<string> {
        if (!(await this.usersRepository.isUserExists(userId))) {
            throw new NotFoundException(generateErrorsMessages('User by userId parameter is not exists', 'userId'))
        }
        return userId
    }

}