import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { AuthQueryTypeORMRepository } from '../../infrastructure/typeORM/auth-query-typeORM-repository'

@ValidatorConstraint({
    name: 'IsEmailAlreadyExists', async: true
})
@Injectable()
export class IsEmailAlreadyInUse implements ValidatorConstraintInterface {
    constructor(private authQueryRepository: AuthQueryTypeORMRepository) { }

    async validate(email: string) {
        const findedUser = await this.authQueryRepository.findUserByEmail(email)
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