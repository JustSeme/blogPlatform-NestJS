import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { AuthRepository } from '../../infrastructure/rawSQL/auth-sql-repository'

@ValidatorConstraint({
    name: 'IsLoginAlreadyExists', async: true
})
@Injectable()
export class IsLoginAlreadyInUse implements ValidatorConstraintInterface {
    constructor(private authRepository: AuthRepository) { }

    async validate(login: string) {
        const findedUser = await this.authRepository.findUserByLogin(login)
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