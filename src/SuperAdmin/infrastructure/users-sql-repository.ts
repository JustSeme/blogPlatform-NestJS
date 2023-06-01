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

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])

        return new UserViewModelType(findedUserData[0])
    }

    async deleteUser(userId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."Users"
                WHERE id = $1
        `

        try {
            await this.dataSource.query(queryString, [userId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async banUserById(userId: string, banReason: string): Promise<boolean> {
        const queryString = `
            UPDATE public."Users"
                SET "isBanned"=true, "banReason"=$2, "banDate"=CURRENT_TIMESTAMP
                WHERE id = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId, banReason])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unbanUserById(userId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."Users"
                SET "isBanned"=false, "banReason"=null, "banDate"=null
                WHERE id = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}