import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import {
    UserDBModel, UserSQLModel
} from '../../SuperAdmin/infrastructure/UsersTypes'
import { EmailConfirmationType } from '../../SuperAdmin/domain/UsersTypes'


@Injectable()
export class AuthRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findUserByRecoveryPasswordCode(recoveryCode: string): Promise<UserDBModel> {
        const queryString = `
            SELECT *
                FROM public."Users"
                WHERE "passwordRecoveryConfirmationCode" = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [recoveryCode])

        if (!findedUserData[0]) {
            return null
        }

        return new UserDBModel(findedUserData[0])
    }

    async isUserByLoginExists(userLogin: string): Promise<boolean> {
        const queryString = `
            SELECT id
                FROM public."Users"
                WHERE "login" = $1;
        `

        const userIdsByLogin = await this.dataSource.query(queryString, [userLogin])

        return userIdsByLogin[0] ? true : false
    }

    async isUserByEmailExists(userEmail: string): Promise<boolean> {
        const queryString = `
            SELECT id
                FROM public."Users"
                WHERE "email" = $1;
        `

        const userIdsByEmail = await this.dataSource.query(queryString, [userEmail])

        return userIdsByEmail[0] ? true : false
    }

    async findUserEmailConfirmationDataByCode(code: string): Promise<EmailConfirmationType> {
        const queryString = `
            SELECT "emailConfirmationCode", "emailExpirationDate", "isEmailConfirmed"
                FROM public."Users"
                WHERE "emailConfirmationCode" = $1;
        `

        const emailConfirmationData = await this.dataSource.query(queryString, [code])

        return emailConfirmationData.map((el) => ({
            confirmationCode: el.emailConfirmationCode,
            expirationDate: el.emailExpirationDate,
            isConfirmed: el.isEmailConfirmed
        }))[0]
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDBModel> {
        const queryString = `
            SELECT *
                FROM public."Users"
                WHERE "login" = $1 OR "email" = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [loginOrEmail])

        if (!findedUserData[0]) {
            return null
        }

        return new UserDBModel(findedUserData[0])
    }

    async updateIsConfirmedByConfirmationCode(code: string) {
        const queryString = `
            UPDATE public."Users"
                SET "emailConfirmationCode"=null, "emailExpirationDate"=null, "isEmailConfirmed"=true
                WHERE "emailConfirmationCode" = $1;
        `

        await this.dataSource.query(queryString, [code])
    }

    async findUserByEmail(email: string): Promise<UserDBModel> {
        const queryString = ` 
            SELECT *
                FROM public."Users"
                WHERE "email" = $1;
        `

        const user: UserSQLModel = await this.dataSource.query(queryString, [email])
        if (!user[0]) {
            return null
        }

        return new UserDBModel(user[0])
    }

    async updateEmailConfirmationInfo(userId: string, newConfirmationCode: string) {
        const queryString = `
            UPDATE public."Users"
                SET "emailConfirmationCode"=$2, "emailExpirationDate"=CURRENT_TIMESTAMP
                WHERE "id" = $1;
        `

        await this.dataSource.query(queryString, [userId, newConfirmationCode])
    }

    async updatePasswordConfirmationInfo(userId: string, passwordRecoveryCode: string) {
        const queryString = `
            UPDATE public."Users"
                SET "passwordRecoveryConfirmationCode"=$2, "passwordRecoveryExpirationDate"=CURRENT_TIMESTAMP
                WHERE id = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId, passwordRecoveryCode])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
        const queryString = `
            UPDATE public."Users"
                SET "passwordRecoveryConfirmationCode"=null, "passwordRecoveryExpirationDate"=null, "passwordHash"=$2
                WHERE id = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId, newPasswordHash])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}