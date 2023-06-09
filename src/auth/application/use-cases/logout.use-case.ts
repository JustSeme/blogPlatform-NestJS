import { JwtService } from "../../../general/adapters/jwt.adapter"
import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { DevicesTypeORMRepository } from "../../../security/infrastructure/typeORM/devices-typeORM-repository"

export class LogoutCommand {
    constructor(public readonly usedToken: string) { }
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand>{
    constructor(
        private jwtService: JwtService,
        private deviceRepository: DevicesTypeORMRepository
    ) { }

    async execute(command: LogoutCommand) {
        const { usedToken } = command
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