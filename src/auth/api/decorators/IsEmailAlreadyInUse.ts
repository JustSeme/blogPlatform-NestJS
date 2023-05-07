import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { UsersQueryRepository } from '../../../SuperAdmin/infrastructure/users-query-repository'

@ValidatorConstraint({
    name: 'IsEmailAlreadyExists', async: true
})
@Injectable()
export class IsEmailAlreadyInUse implements ValidatorConstraintInterface {
    constructor(private usersQueryRepository: UsersQueryRepository) { }

    async validate(email: string) {
        const findedUser = await this.usersQueryRepository.findUserByEmail(email)
        if (findedUser) {
            return false
        }
        return true
    }

    defaultMessage() {
        // here you can provide default error message if validation failed
        return 'Email already in use'
    }
}