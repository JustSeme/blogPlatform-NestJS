import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { UsersQueryRepository } from '../../../general/users/infrastructure/users-query-repository'

@ValidatorConstraint({
    name: 'IsLoginAlreadyExists', async: true
})
@Injectable()
export class IsLoginAlreadyInUse implements ValidatorConstraintInterface {
    constructor(private usersQueryRepository: UsersQueryRepository) { }

    async validate(login: string) {
        const findedUser = await this.usersQueryRepository.findUserByLogin(login)
        if (findedUser) {
            return false
        }
        return true
    }

    defaultMessage() {
        // here you can provide default error message if validation failed
        return 'Login already in use'
    }
}