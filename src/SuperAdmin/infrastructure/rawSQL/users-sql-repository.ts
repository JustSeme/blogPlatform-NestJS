import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'
import { UserDTO } from '../../domain/UsersTypes'
import { UserViewModelType } from '../../application/dto/users/UsersViewModel'
import { BanUserForBlogInfoType } from '../../../Blogger/infrastructure/blogs/BanUserForBlogInfoType'
import { UserEntity } from '../../domain/typeORM/user.entity'
import { UserEmailConfirmation } from '../../domain/typeORM/user-email-confirmation.entity'
import { UserPasswordRecovery } from '../../domain/typeORM/user-password-recovery.entity'
import { UserBanInfo } from '../../domain/typeORM/user-ban-info.entity'
import { BansUsersForBlogs } from '../../../Blogger/domain/blogs/typeORM/bans-users-for-blogs.entity'

@Injectable()
export class UsersSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createNewUser(newUser: UserDTO): Promise<UserViewModelType | null> {
        const createUserQuery = `
            INSERT INTO public."user_entity"
                (
                "login", "email", "passwordHash", "isConfirmed"
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id;
        `

        const createEmailConfirmationQuery = `
            INSERT INTO public."user_email_confirmation"
                (
                "emailConfirmationCode", "emailExpirationDate", "userId", "isEmailConfirmed"
                )
                VALUES ($1, $2, $3, $4)
        `

        const createBanInfoQuery = `
            INSERT INTO public."user_ban_info"
                (
                "userId"
                )
                VALUES ($1)
        `

        const createPasswordRecoveryQuery = `
            INSERT INTO public."user_password_recovery"
                (
                "userId"
                )
                VALUES ($1)
        `

        const querySelect = `
            SELECT *, ue."id"
                FROM public."user_entity" ue
                LEFT JOIN user_ban_info ubi on ubi."userId" = ue.id
                WHERE ue."id" = $1
        `

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const userId = await queryRunner.query(createUserQuery, [
                newUser.login,
                newUser.email,
                newUser.passwordHash,
                newUser.emailConfirmation.isConfirmed
            ])

            await queryRunner.query(createEmailConfirmationQuery, [
                newUser.emailConfirmation.confirmationCode,
                newUser.emailConfirmation.expirationDate,
                userId[0].id,
                newUser.emailConfirmation.isConfirmed
            ])

            await queryRunner.query(createBanInfoQuery, [
                userId[0].id
            ])

            await queryRunner.query(createPasswordRecoveryQuery, [
                userId[0].id
            ])

            const createdUser: Array<UserEntity & UserBanInfo> = await queryRunner.query(querySelect, [userId[0].id])

            await queryRunner.commitTransaction()

            return new UserViewModelType(createdUser[0])
        } catch (err) {
            console.error('Error in create user transaction', err)

            await queryRunner.rollbackTransaction()

            return null
        } finally {
            await queryRunner.release()
        }
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."user_entity" ue
                LEFT JOIN user_ban_info ubi ON ubi."userId" = ue.id
                WHERE ue."id" = $1;
        `

        try {
            const findedUserData: UserEntity & UserBanInfo = await this.dataSource.query(queryString, [userId])

            if (!findedUserData[0]) {
                return null
            }

            return new UserViewModelType(findedUserData[0])
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserData(userId: string): Promise<UserEntity> {
        const queryString = `
            SELECT *
                FROM user_entity
                WHERE "id" = $1;
        `

        const findedUserData: UserEntity = await this.dataSource.query(queryString, [userId])

        return findedUserData[0]
    }

    async findUserDataWithPasswordRecovery(userId: string): Promise<UserEntity & UserPasswordRecovery> {
        const queryString = `
            SELECT *
                FROM user_entity ue
                LEFT JOIN user_password_recovery upr ON upr."userId" = ue.id
                WHERE ue."id" = $1;
        `

        const findedUserData: UserEntity & UserPasswordRecovery = await this.dataSource.query(queryString, [userId])

        return findedUserData[0]
    }

    async findUserDataWithEmailConfirmation(userId: string): Promise<UserEntity & UserEmailConfirmation> {
        const queryString = `
            SELECT *, ue."id"
                FROM public."user_entity" ue
                LEFT JOIN public."user_email_confirmation" uec ON uec."userId" = ue."id"
                WHERE ue."id" = $1;
        `

        const findedConfirmationData: UserEntity & UserEmailConfirmation = await this.dataSource.query(queryString, [userId])
        return findedConfirmationData[0]
    }

    async deleteUser(userId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."user_entity"
                WHERE "id" = $1;
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
            UPDATE public."user_ban_info"
                SET "isBanned"=true, "banReason"=$2, "banDate"=CURRENT_TIMESTAMP
                WHERE "userId" = $1
        `

        const banUserQuery = `
            UPDATE public."user_entity"
                SET "isBanned"=true
                WHERE id = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId, banReason])
            await this.dataSource.query(banUserQuery, [userId])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async unbanUserById(userId: string): Promise<boolean> {
        const queryString = `
            UPDATE public."user_ban_info"
                SET "isBanned"=false, "banReason"=null, "banDate"=null
                WHERE "userId" = $1;
        `

        const unbanUserQuery = `
            UPDATE public."user_entity"
                SET "isBanned"=false
                WHERE id = $1;
        `

        try {
            await this.dataSource.query(queryString, [userId])
            await this.dataSource.query(unbanUserQuery, [userId])
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

    async unbanUserForCurrentBlog(userId: string, blogId: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public.bans_users_for_blogs
                WHERE "userId"=$1 AND "blogId"=$2;
        `

        try {
            await this.dataSource.query(queryString, [userId, blogId])

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findUserBlogsBanInfo(userId: string): Promise<BansUsersForBlogs[]> {
        const queryString = `
            SELECT *
                FROM public.bans_users_for_blogs
                WHERE "userId" = $1;
        `

        try {
            return this.dataSource.query(queryString, [userId])
        } catch (err) {
            console.error(err)
            throw new Error(`Something happened, the application can't get userBansInfo`)
        }
    }
}