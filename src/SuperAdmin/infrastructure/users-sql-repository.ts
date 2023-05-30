import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import {
    EmailConfirmationType, UserDTO
} from '../domain/UsersTypes'
import { UserViewModelType } from '../application/dto/UsersViewModel'
import {
    UserDBModel, UserSQLModel
} from './UsersTypes'


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

        return new UserViewModelType(
            findedUserData.id,
            findedUserData.login,
            findedUserData.email,
            findedUserData.createdAt,
            findedUserData.isBanned,
            findedUserData.banDate,
            findedUserData.banReason,
        )
    }

    async isUserByLoginExists(userLogin: string): Promise<boolean> {
        const queryString = `
            SELECT id
                FROM public."Users"
                WHERE login = $1;
        `


        const userIdsByLogin = await this.dataSource.query(queryString, [userLogin])

        return userIdsByLogin[0] ? true : false
    }

    async isUserByEmailExists(userEmail: string): Promise<boolean> {
        const queryString = `
            SELECT id
                FROM public."Users"
                WHERE email = $1;
        `

        const userIdsByEmail = await this.dataSource.query(queryString, [userEmail])

        return userIdsByEmail[0] ? true : false
    }

    async findUserEmailConfirmationDataByCode(code: string): Promise<EmailConfirmationType> {
        const queryString = `
            SELECT "emailConfirmationCode", "emailExpirationDate", "isEmailConfirmed"
                FROM public."Users"
                WHERE "emailConfirmationCode" = '$1;
        `

        const emailConfirmationData = await this.dataSource.query(queryString, [code])

        return emailConfirmationData.map((el) => ({
            confirmationCode: el.emailConfirmationCode,
            expirationDate: el.emailExpirationDate,
            isConfirmed: el.isEmailConfirmed
        }))[0]
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
                WHERE email = $1;
        `

        const user: UserSQLModel = await this.dataSource.query(queryString, [email])
        return new UserDBModel(user)
    }

    async updateEmailConfirmationInfo(userId: string, newConfirmationCode: string) {
        const queryString = `
            UPDATE public."Users"
                SET "emailConfirmationCode"=$2, "emailExpirationDate"=CURRENT_TIMESTAMP
                WHERE id = $1;
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
}