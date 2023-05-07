import { v4 as uuidv4 } from 'uuid'
import jwt, { JwtPayload } from "jsonwebtoken"
import { JwtService } from '../../../general/adapters/jwt.adapter'
import { DeviceRepository } from '../../../security/infrastructure/device-db-repository'
import { AuthConfig } from '../../../configuration/auth.config'
import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { UnauthorizedException } from '@nestjs/common'
import { generateErrorsMessages } from '../../../general/helpers'
import { DeviceAuthSessionDBModel } from '../../../security/domain/DeviceAuthSessionType'
import { UsersRepository } from '../../../SuperAdmin/infrastructure/users-db-repository'

export class LoginCommand {
    constructor(
        public readonly userId: string,
        public readonly userIp: string,
        public readonly deviceName: string
    ) { }
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
    private tokensSettings: {
        ACCESS_TOKEN_EXPIRE_TIME: string,
        REFRESH_TOKEN_EXPIRE_TIME: string,
    }

    constructor(
        private jwtService: JwtService,
        private deviceRepository: DeviceRepository,
        private usersRepository: UsersRepository,
        private readonly authConfig: AuthConfig,
    ) {
        this.tokensSettings = this.authConfig.getTokensSettings()
    }

    async execute(command: LoginCommand) {
        const deviceId = uuidv4()
        const {
            userId,
            userIp,
            deviceName
        } = command

        const user = await this.usersRepository.findUserById(userId)
        const isBanned = user.isBanned()

        if (isBanned) {
            throw new UnauthorizedException(generateErrorsMessages(`You are banned by banReason: ${user.banInfo.banReason}`, 'userId'))
        }

        const accessToken = await this.jwtService.createAccessToken(this.tokensSettings.ACCESS_TOKEN_EXPIRE_TIME, userId)
        const refreshToken = await this.jwtService.createRefreshToken(this.tokensSettings.REFRESH_TOKEN_EXPIRE_TIME, deviceId, userId)
        const result = await jwt.decode(refreshToken) as JwtPayload

        const newSession = new DeviceAuthSessionDBModel(result.iat, result.exp, userId, userIp, deviceId, deviceName)

        const isAdded = await this.deviceRepository.addSession(newSession)
        if (!isAdded) {
            return null
        }

        return {
            accessToken,
            refreshToken
        }
    }
}