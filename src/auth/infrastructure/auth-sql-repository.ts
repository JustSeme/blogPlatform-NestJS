import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import {
    UserDBModel, UserSQLModel
} from '../../SuperAdmin/infrastructure/UsersTypes'
import { EmailConfirmationType } from '../../SuperAdmin/domain/UsersTypes'
import { add } from 'date-fns'


@Injectable()
export class AuthRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findUserByRecoveryPasswordCode(recoveryCode: string): Promise<UserDBModel> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
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
                FROM public."user_entity"
                WHERE "login" = $1;
        `

        const userIdsByLogin = await this.dataSource.query(queryString, [userLogin])

        return userIdsByLogin[0] ? true : false
    }

    async isUserByEmailExists(userEmail: string): Promise<boolean> {
        const queryString = `
            SELECT id
                FROM public."user_entity"
                WHERE "email" = $1;
        `

        const userIdsByEmail = await this.dataSource.query(queryString, [userEmail])

        return userIdsByEmail[0] ? true : false
    }

    async findUserEmailConfirmationDataByCode(code: string): Promise<EmailConfirmationType> {
        const queryString = `
            SELECT "emailConfirmationCode", "emailExpirationDate", "isEmailConfirmed"
                FROM public."user_entity"
                WHERE "emailConfirmationCode" = $1;
        `

        const emailConfirmationData = await this.dataSource.query(queryString, [code])

        if (!emailConfirmationData[0]) {
            return null
        }

        return {
            confirmationCode: emailConfirmationData[0].emailConfirmationCode,
            expirationDate: emailConfirmationData[0].emailExpirationDate,
            isConfirmed: emailConfirmationData[0].isEmailConfirmed
        }
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDBModel> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
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
            UPDATE public."user_entity"
                SET "emailConfirmationCode"=null, "emailExpirationDate"=null, "isEmailConfirmed"=true
                WHERE "emailConfirmationCode" = $1;
        `

        await this.dataSource.query(queryString, [code])
    }

    async findUserByEmail(email: string): Promise<UserDBModel> {
        const queryString = ` 
            SELECT *
                FROM public."user_entity"
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
            UPDATE public."user_entity"
                SET "emailConfirmationCode"=$2, "emailExpirationDate"=$3
                WHERE "id" = $1;
        `

        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })

        await this.dataSource.query(queryString, [userId, newConfirmationCode, expirationDate])
    }

    async updatePasswordConfirmationInfo(userId: string, passwordRecoveryCode: string) {
        const queryString = `
            UPDATE public."user_entity"
                SET "passwordRecoveryConfirmationCode"=$2, "passwordRecoveryExpirationDate"=$3
                WHERE id = $1;
        `

        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })

        try {
            await this.dataSource.query(queryString, [userId, passwordRecoveryCode, expirationDate])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
        const queryString = `
            UPDATE public."user_entity"
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