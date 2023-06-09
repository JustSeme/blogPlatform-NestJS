import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { AuthQueryTypeORMRepository } from '../../infrastructure/typeORM/auth-query-typeORM-repository'

@ValidatorConstraint({
    name: 'IsLoginAlreadyExists', async: true
})
@Injectable()
export class IsLoginAlreadyInUse implements ValidatorConstraintInterface {
    constructor(private authQueryRepository: AuthQueryTypeORMRepository) { }

    async validate(login: string) {
        const findedUser = await this.authQueryRepository.findUserByLogin(login)
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