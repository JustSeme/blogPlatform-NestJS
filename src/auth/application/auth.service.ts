import { UserViewModelType } from './dto/UsersViewModel'
import { UsersRepository } from '../infrastructure/users-db-repository'
import { v4 as uuidv4 } from 'uuid'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose/dist'
import { User } from '../domain/UsersSchema'
import { UserModelType } from '../domain/UsersTypes'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { EmailManager } from '../../general/managers/emailManager'
import { DeviceRepository } from '../../security/infrastructure/device-db-repository'
import { BcryptAdapter } from '../../general/adapters/bcrypt.adapter'
import { DeviceAuthSessionDTO } from '../../security/domain/DeviceAuthSessionType'
import { JwtService } from '../../general/adapters/jwt.sevice'
import { AuthConfig } from '../../configuration/auth.config'


//transaction script
@Injectable()
export class AuthService {
    private tokensSettings: {
        ACCESS_TOKEN_EXPIRE_TIME: string,
        REFRESH_TOKEN_EXPIRE_TIME: string,
    }

    constructor(@InjectModel(User.name) private UserModel: UserModelType,
        protected usersRepository: UsersRepository,
        protected jwtService: JwtService,
        protected emailManager: EmailManager,
        private deviceRepository: DeviceRepository,
        private bcryptAdapter: BcryptAdapter,
        private readonly authConfig: AuthConfig) {
        this.tokensSettings = this.authConfig.getTokensSettings()
    }

    async createUser(login: string, password: string, email: string): Promise<boolean> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(password, 10)

        const newUser = this.UserModel.makeInstance(login, email, passwordHash, false, this.UserModel)

        this.usersRepository.save(newUser)

        await this.emailManager.sendConfirmationCode(email, login, newUser.emailConfirmation.confirmationCode)

        return true
    }

    async createUserWithBasicAuth(login: string, password: string, email: string): Promise<UserViewModelType | null> {
        const passwordHash = await this.bcryptAdapter.generatePasswordHash(password, 10)

        const newUser = this.UserModel.makeInstance(login, email, passwordHash, true, this.UserModel)

        await this.usersRepository.save(newUser)
        const displayedUser: UserViewModelType = {
            id: newUser.id,
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt
        }

        return displayedUser
    }

    async confirmEmail(code: string) {
        const user = await this.usersRepository.findUserByConfirmationCode(code)
        if (!user) return false


        if (!user.canBeConfirmed(code)) {
            return false
        }
        const isConfirmed = user.updateIsConfirmed()
        if (isConfirmed) {
            this.usersRepository.save(user)
        }
        return isConfirmed
    }

    async resendConfirmationCode(email: string) {
        const user = await this.usersRepository.findUserByEmail(email)
        if (!user || user.emailConfirmation.isConfirmed) return false

        const newConfirmationCode = uuidv4()
        await this.usersRepository.updateEmailConfirmationInfo(user.id, newConfirmationCode)

        try {
            return await this.emailManager.sendConfirmationCode(email, user.login, newConfirmationCode)
        } catch (error) {
            console.error(error)
            this.usersRepository.deleteUser(user.id)
            return false
        }
    }

    async checkCredentials(loginOrEmail: string, password: string) {
        const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return false
        if (!user.emailConfirmation.isConfirmed) return false

        const isConfirmed = await this.bcryptAdapter.comparePassword(password, user.passwordHash)
        if (isConfirmed) {
            return user
        }
    }

    async sendPasswordRecoveryCode(email: string) {
        const user = await this.usersRepository.findUserByEmail(email)
        if (!user) {
            return true
        }
        const passwordRecoveryCode = uuidv4()

        await this.emailManager.sendPasswordRecoveryCode(user.email, user.login, passwordRecoveryCode)

        const isUpdated = await this.usersRepository.updatePasswordConfirmationInfo(user.id, passwordRecoveryCode)
        if (!isUpdated) {
            return false
        }
        return true
    }

    async confirmRecoveryPassword(userId: string, newPassword: string) {
        const newPasswordHash = await this.bcryptAdapter.generatePasswordHash(newPassword, 10)

        return this.usersRepository.updateUserPassword(userId, newPasswordHash)
    }

    async deleteUsers(userId: string) {
        return this.usersRepository.deleteUser(userId)
    }

    async login(userId: string, userIp: string, deviceName: string) {
        const deviceId = uuidv4()

        const accessToken = await this.jwtService.createAccessToken(this.tokensSettings.ACCESS_TOKEN_EXPIRE_TIME, userId)
        const refreshToken = await this.jwtService.createRefreshToken(this.tokensSettings.REFRESH_TOKEN_EXPIRE_TIME, deviceId, userId)
        const result = await jwt.decode(refreshToken) as JwtPayload

        const newSession = new DeviceAuthSessionDTO(result.iat, result.exp, userId, userIp, deviceId, deviceName)

        const isAdded = await this.deviceRepository.addSession(newSession)
        if (!isAdded) {
            return null
        }

        return {
            accessToken,
            refreshToken
        }
    }

    async logout(usedToken: string) {
        const result = await this.jwtService.verifyRefreshToken(usedToken)

        if (!result) {
            return false
        }

        const isDeleted = this.deviceRepository.removeSession(result.deviceId)

        if (!isDeleted) {
            return false
        }
        return true
    }
}