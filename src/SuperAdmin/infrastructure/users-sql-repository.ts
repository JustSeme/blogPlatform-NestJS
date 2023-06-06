import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import { UserDTO } from '../domain/UsersTypes'
import { UserViewModelType } from '../application/dto/UsersViewModel'
import {
    UserDBModel, UserSQLModel
} from './UsersTypes'

@Injectable()
export class UsersSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createNewUser(newUser: UserDTO) {
        const query = `
            INSERT INTO public."user_entity"
                (
                "login", "email", "passwordHash", "emailConfirmationCode", "emailExpirationDate", "isEmailConfirmed"
                )
                VALUES ($1, $2, $3, $4, $5, $6);
        `

        try {
            await this.dataSource.query(query, [
                newUser.login,
                newUser.email,
                newUser.passwordHash,
                newUser.emailConfirmation.confirmationCode,
                newUser.emailConfirmation.expirationDate,
                newUser.emailConfirmation.isConfirmed
            ])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
                WHERE id = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])

        return new UserViewModelType(findedUserData[0])
    }

    async findUserDBModelById(userId: string): Promise<UserDBModel> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
                WHERE id = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])

        return new UserDBModel(findedUserData[0])
    }

    async deleteUser(userId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."user_entity"
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
            UPDATE public."user_entity"
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
            UPDATE public."user_entity"
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

    async isUserExists(userId: string): Promise<boolean> {
        const user = await this.findUserById(userId)

        return user ? true : false
    }
}