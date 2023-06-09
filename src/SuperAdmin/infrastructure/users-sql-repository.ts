import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import { UserDTO } from '../domain/UsersTypes'
import { UserViewModelType } from '../application/dto/UsersViewModel'
import {
    UserDBModel, UserSQLModel
} from './UsersTypes'
import { BanUserForBlogInfoType } from '../../Blogger/infrastructure/blogs/BanUserForBlogInfoType'

@Injectable()
export class UsersSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createNewUser(newUser: UserDTO): Promise<UserDBModel | null> {
        const query = `
            INSERT INTO public."user_entity"
                (
                "login", "email", "passwordHash", "emailConfirmationCode", "emailExpirationDate", "isEmailConfirmed"
                )
                VALUES ($1, $2, $3, $4, $5, $6);
        `

        const querySelect = `
            SELECT *
                FROM public."user_entity"
                WHERE "login" = $1
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

            const createdUser: UserSQLModel[] = await this.dataSource.query(querySelect, [newUser.login])

            return new UserDBModel(createdUser[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."user_entity"
                WHERE id = $1;
        `

        try {
            const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])

            if (!findedUserData[0]) {
                return null
            }

            return new UserViewModelType(findedUserData[0])
        } catch (err) {
            console.error(err)
            return null
        }
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

    async banUserForCurrentBlog(userId: string, banInfo: BanUserForBlogInfoType): Promise<boolean> {
        const queryString = `
            INSERT INTO public.bans_users_for_blogs
                ("isBanned", "banReason", "banDate", "userId", "blogId")
                VALUES(true, $1, now(), $2, $3);
        `

        try {
            await this.dataSource.query(queryString, [banInfo.banReason, userId, banInfo.blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}