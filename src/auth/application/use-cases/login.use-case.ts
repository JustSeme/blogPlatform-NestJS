import { v4 as uuidv4 } from 'uuid'
import jwt, { JwtPayload } from "jsonwebtoken"
import { JwtService } from '../../../general/adapters/jwt.adapter'
import { AuthConfig } from '../../../configuration/auth.config'
import {
    CommandHandler, ICommandHandler
} from '@nestjs/cqrs'
import { UnauthorizedException } from '@nestjs/common'
import { generateErrorsMessages } from '../../../general/helpers/helpers'
import { AuthSession } from '../../../security/domain/typeORM/auth-session.entity'
import { DevicesTypeORMRepository } from '../../../security/infrastructure/typeORM/devices-typeORM-repository'
import { UserEntity } from '../../../SuperAdmin/domain/typeORM/user.entity'

export class LoginCommand {
    constructor(
        public readonly user: UserEntity,
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
        private deviceRepository: DevicesTypeORMRepository,
        private readonly authConfig: AuthConfig,
    ) {
        this.tokensSettings = this.authConfig.getTokensSettings()
    }

    async execute(command: LoginCommand) {
        const deviceId = uuidv4()
        const {
            user,
            userIp,
            deviceName
        } = command

        if (!user || user.isBanned) {
            throw new UnauthorizedException(generateErrorsMessages(`You are banned`, 'userId'))
        }

        const accessToken = await this.jwtService.createAccessToken(user.id)
        const refreshToken = await this.jwtService.createRefreshToken(deviceId, user.id)
        const result = await jwt.decode(refreshToken) as JwtPayload

        const newSession = new AuthSession()
        newSession.issuedAt = result.iat
        newSession.expireDate = result.exp
        newSession.user = user
        newSession.userIp = userIp
        newSession.deviceId = deviceId
        newSession.deviceName = deviceName

        const savedDevice = await this.deviceRepository.dataSourceSave(newSession)
        if (!savedDevice) {
            return null
        }

        return {
            accessToken,
            refreshToken
        }
    }
}