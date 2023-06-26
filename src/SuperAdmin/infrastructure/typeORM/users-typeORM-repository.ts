import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../domain/typeORM/user.entity"
import { Repository } from "typeorm"
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
        private usersBanInfoRepository: Repository<UserBanInfo>,
        private usersEmailConfirmationsRepository: Repository<UserEmailConfirmation>,
        private usersPasswordRecoveriesRepository: Repository<UserPasswordRecovery>
    ) { }

    async createNewUser(newUser: UserDTO): Promise<UserViewModelType | null> {
        const queryRunner = this.usersRepository.queryRunner

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
}