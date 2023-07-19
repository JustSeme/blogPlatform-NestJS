import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import { EmailConfirmationType } from '../../../SuperAdmin/domain/UsersTypes'
import { UserPasswordRecovery } from '../../../SuperAdmin/domain/typeORM/users/user-password-recovery.entity'
import { UserEntity } from '../../../SuperAdmin/domain/typeORM/user.entity'
import { UserEmailConfirmation } from '../../../SuperAdmin/domain/typeORM/users/user-email-confirmation.entity'


@Injectable()
export class AuthRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findUserDataWithPasswordRecovery(recoveryCode: string): Promise<UserPasswordRecovery & UserEntity> {
        const queryString = `
            SELECT *
                FROM public."user_password_recovery" upr
                LEFT JOIN user_entity ue ON ue.id = upr."userId" 
                WHERE "passwordRecoveryConfirmationCode" = $1;
        `

        const findedUserData: UserPasswordRecovery & UserEntity = await this.dataSource.query(queryString, [recoveryCode])

        if (!findedUserData[0]) {
            return null
        }

        return findedUserData[0]
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
                FROM public."user_email_confirmation"
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

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
                WHERE "login" = $1 OR "email" = $1;
        `

        const findedUserData: UserEntity = await this.dataSource.query(queryString, [loginOrEmail])

        if (!findedUserData[0]) {
            return null
        }

        return findedUserData[0]
    }

    async findUserByLogin(login: string): Promise<UserEntity> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
                WHERE "login" = $1;
        `

        const findedUserData: UserEntity[] = await this.dataSource.query(queryString, [login])

        if (!findedUserData[0]) {
            return null
        }

        return findedUserData[0]
    }

    async updateIsConfirmedByConfirmationCode(code: string) {
        const queryString = `
            UPDATE public."user_email_confirmation" uec
                SET "emailConfirmationCode"=null, "emailExpirationDate"=null, "isEmailConfirmed"=true
                WHERE "emailConfirmationCode" = $1
                RETURNING uec."userId"
        `

        const updateUserQuery = `
            UPDATE public."user_entity" ue
            SET "isConfirmed"=true
            WHERE "id" = $1
        `

        try {
            const userIdData = await this.dataSource.query(queryString, [code])

            await this.dataSource.query(updateUserQuery, [userIdData[0][0].userId])
            return true
        } catch (error) {
            console.error('Error in confirm email', error)
            return false
        }
    }

    async findUserByEmail(email: string): Promise<UserEntity> {
        const queryString = ` 
            SELECT *
                FROM public."user_entity"
                WHERE "email" = $1;
        `

        const user: UserEntity = await this.dataSource.query(queryString, [email])
        if (!user[0]) {
            return null
        }

        return user[0]
    }

    async findUserWithEmailConfirmationByEmail(email: string): Promise<UserEntity & UserEmailConfirmation> {
        const queryString = ` 
            SELECT *
                FROM public."user_entity" ue
                LEFT JOIN user_email_confirmation uec ON uec."userId" = ue.id
                WHERE "email" = $1;
        `

        const user: UserEntity & UserEmailConfirmation = await this.dataSource.query(queryString, [email])
        if (!user[0]) {
            return null
        }

        return user[0]
    }

    async updateEmailConfirmationInfo(userId: string, newConfirmationCode: string, expirationDate: Date) {
        const queryString = `
            UPDATE public."user_email_confirmation"
                SET "emailConfirmationCode"=$2, "emailExpirationDate"=$3
                WHERE "userId" = $1;
        `

        await this.dataSource.query(queryString, [userId, newConfirmationCode, expirationDate])
    }

    async updatePasswordConfirmationInfo(userId: string, passwordRecoveryCode: string, expirationDate: Date) {
        const queryString = `
            UPDATE public."user_password_recovery"
                SET "passwordRecoveryConfirmationCode"=$2, "passwordRecoveryExpirationDate"=$3
                WHERE "userId" = $1;
        `

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
                SET "passwordHash"=$2
                WHERE id = $1;
        `

        const updatePasswordRecovery = `
            UPDATE public."user_password_recovery"
                SET "passwordRecoveryConfirmationCode"=null, "passwordRecoveryExpirationDate"=null
                WHERE "userId" = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId, newPasswordHash])

            await this.dataSource.query(updatePasswordRecovery, [userId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}