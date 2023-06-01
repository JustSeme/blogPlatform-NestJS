import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import { UserDTO } from '../domain/UsersTypes'
import { UserViewModelType } from '../application/dto/UsersViewModel'
import { UserSQLModel } from './UsersTypes'


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

        await this.dataSource.query(query, [
            newUser.login,
            newUser.email,
            newUser.passwordHash,
            newUser.emailConfirmation.confirmationCode,
            newUser.emailConfirmation.expirationDate,
            newUser.emailConfirmation.isConfirmed
        ])
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."Users"
                WHERE id = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])[0]

        return new UserViewModelType(findedUserData)
    }
}