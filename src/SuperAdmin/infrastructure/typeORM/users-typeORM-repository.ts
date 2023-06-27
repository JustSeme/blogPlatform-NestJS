import { Injectable } from "@nestjs/common"
import {
    InjectDataSource, InjectRepository
} from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import {
    DataSource, Repository
} from "typeorm"
import { UserDTO } from "../../domain/UsersTypes"
import { UserBanInfo } from "../../domain/typeORM/user-ban-info.entity"
import { UserViewModelType } from "../../application/dto/UsersViewModel"
import { UserPasswordRecovery } from "../../domain/typeORM/user-password-recovery.entity"
import { UserEmailConfirmation } from "../../domain/typeORM/user-email-confirmation.entity"

@Injectable()
export class UsersTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserBanInfo)
        private usersBanInfoRepository: Repository<UserBanInfo>,
        @InjectRepository(UserEmailConfirmation)
        private usersEmailConfirmationsRepository: Repository<UserEmailConfirmation>,
        @InjectRepository(UserPasswordRecovery)
        private usersPasswordRecoveriesRepository: Repository<UserPasswordRecovery>,
        @InjectDataSource() private dataSource: DataSource,
    ) { }

    async createNewUser(newUser: UserDTO): Promise<UserViewModelType | null> {
        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        try {
            const userEntityData = {
                login: newUser.login,
                email: newUser.email,
                passwordHash: newUser.passwordHash,
                isConfirmed: newUser.emailConfirmation.isConfirmed
            } as UserEntity

            const user = await this.usersRepository.save(userEntityData)

            const userBanInfoData = {
                banReason: null,
                banDate: null,
                userId: user.id
            }

            const userBanInfo = await this.usersBanInfoRepository.save(userBanInfoData)

            const userEmailConfirmationData = {
                emailConfirmationCode: newUser.emailConfirmation.confirmationCode,
                emailExpirationDate: newUser.emailConfirmation.expirationDate,
                isEmailConfirmed: newUser.emailConfirmation.isConfirmed,
                userId: user.id
            }

            await this.usersEmailConfirmationsRepository.save(userEmailConfirmationData)

            const userPasswordRecoveryData = {
                passwordRecoveryConfirmationCode: newUser.passwordRecovery.confirmationCode,
                passwordRecoveryExpirationDate: newUser.passwordRecovery.expirationDate,
                userId: user.id,
            }

            await this.usersPasswordRecoveriesRepository.save(userPasswordRecoveryData)

            await queryRunner.commitTransaction()

            return new UserViewModelType({
                ...user, ...userBanInfo
            })
        } catch (err) {
            console.error('Error in create user transaction', err)

            await queryRunner.rollbackTransaction()

            return null
        } finally {
            await queryRunner.release()
        }
    }

    async findUserById(userId: string): Promise<UserViewModelType> {
        try {
            const findedUserData = await this.usersRepository
                .createQueryBuilder('u')
                .where('u.id = :userId', { userId })
                .getOne()

            const findedBanInfoData = await this.usersBanInfoRepository
                .createQueryBuilder('ubi')
                .where(`ubi.userId = :userId`, { userId })
                .getOne()

            return new UserViewModelType({
                ...findedUserData, ...findedBanInfoData
            })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserData(userId: string): Promise<UserEntity> {
        try {
            return this.usersRepository.findOneBy({ id: userId })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    /* async findUserDataWithPasswordRecovery(userId: string): Promise<UserEntity & UserPasswordRecovery> {
        try {
            const findedUserData = await this.findUserData(userId)
            const findedPasswordRecoveryData = await this.usersPasswordRecoveriesRepository.findOneBy({ userId })

            return {
                ...findedUserData, ...findedPasswordRecoveryData
            }
        } catch (err) {
            console.error(err)
            return null
        }

    }

    async findUserDataWithEmailConfirmation(userId: string): Promise<UserEntity & UserEmailConfirmation> {
        try {
            const findedUserData = await this.findUserData(userId)
            const findedEmailConfirmationData = await this.usersEmailConfirmationsRepository.findOneBy({ userId })

            return {
                ...findedUserData, ...findedEmailConfirmationData
            }
        } catch (err) {
            console.error(err)
            return null
        }
    } */
}