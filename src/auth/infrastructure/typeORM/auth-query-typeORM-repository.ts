import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { Repository } from "typeorm"
import { UserPasswordRecovery } from "../../../SuperAdmin/domain/typeORM/user-password-recovery.entity"
import { UserEmailConfirmation } from "../../../SuperAdmin/domain/typeORM/user-email-confirmation.entity"

@Injectable()
export class AuthQueryTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserPasswordRecovery)
        private userPasswordRecoveryRepository: Repository<UserPasswordRecovery>,
        @InjectRepository(UserEmailConfirmation)
        private userEmailConfirmationRepository: Repository<UserEmailConfirmation>,
    ) { }

    async isUserByLoginExists(userLogin: string): Promise<boolean> {
        try {
            const userByLogin = await this.usersRepository.findOne({ where: { login: userLogin } })

            return userByLogin ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async isUserByEmailExists(userEmail: string): Promise<boolean> {
        try {
            const userByEmail = await this.usersRepository.findOne({ where: { email: userEmail } })

            return userByEmail ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async findUserByLogin(login: string): Promise<UserEntity> {
        try {
            return this.usersRepository.findOne({ where: { login } })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserByEmail(email: string): Promise<UserEntity> {
        try {
            return this.usersRepository.findOne({ where: { email } })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity> {
        return this.usersRepository
            .createQueryBuilder('u')
            .where('u.login = :loginOrEmail', { loginOrEmail })
            .orWhere('u.email = :loginOrEmail', { loginOrEmail })
            .getOne()
    }

    async findUserPasswordRecoveryDataByRecoveryCode(recoveryCode: string): Promise<UserPasswordRecovery> {
        try {
            const passwwordRecoveryData = await this.userPasswordRecoveryRepository
                .createQueryBuilder('upr')
                .where('upr.passwordRecoveryConfirmationCode = :recoveryCode', { recoveryCode })
                .getOne()

            return passwwordRecoveryData
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserPasswordRecoveryDataByUserId(userId: string): Promise<UserPasswordRecovery> {
        try {
            return this.userPasswordRecoveryRepository.findOne({ where: { user: { id: userId } } })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserData(userId: string): Promise<UserEntity> {
        try {
            return this.usersRepository.findOne({ where: { id: userId } })
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserEmailConfirmationDataByCode(code: string): Promise<UserEmailConfirmation & UserEntity> {
        try {
            const userData = await this.userEmailConfirmationRepository.findOne({
                where: { emailConfirmationCode: code },
                relations: { user: true }
            })

            return userData as UserEmailConfirmation & UserEntity
        } catch (err) {
            console.error(err)
            return null
        }
    }

    async findUserEmailConfirmationDataByUserId(userId: string): Promise<UserEmailConfirmation> {
        try {
            return this.userEmailConfirmationRepository.findOne({ where: { user: { id: userId } } })
        } catch (err) {
            console.error(err)
            return null
        }
    }
}