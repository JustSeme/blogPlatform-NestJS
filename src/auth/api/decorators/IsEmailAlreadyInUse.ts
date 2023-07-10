import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { AuthRepository } from '../../infrastructure/rawSQL/auth-sql-repository'

@ValidatorConstraint({
    name: 'IsEmailAlreadyExists', async: true
})
@Injectable()
export class IsEmailAlreadyInUse implements ValidatorConstraintInterface {
    constructor(private authRepository: AuthRepository) { }

    async validate(email: string) {
        const findedUser = await this.authRepository.findUserByEmail(email)
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