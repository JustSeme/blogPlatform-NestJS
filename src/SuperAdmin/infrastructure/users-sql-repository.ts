import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import { UserDTO } from '../domain/UsersTypes'


@Injectable()
export class UsersSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createNewUser(newUser: UserDTO) {
        const query = `
            INSERT INTO public."Users"
                (
                "login", "email", "passwordHash", "emailConfirmationCode", "emailExpirationDate", "isEmailConfirmed"
                )
                VALUES ($1, $2, $3, $4, $5, $6);
        `

        const result = this.dataSource.query(query, [
            newUser.login,
            newUser.email,
            newUser.passwordHash,
            newUser.emailConfirmation.confirmationCode,
            newUser.emailConfirmation.expirationDate,
            newUser.emailConfirmation.isConfirmed
        ])

        return result ? true : false
    }
}