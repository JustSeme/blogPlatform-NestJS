import { Injectable } from "@nestjs/common"
import { JwtService } from "../../../general/adapters/jwt.adapter"
import { DeviceRepository } from "../../../security/infrastructure/device-db-repository"

@Injectable()
export class LogoutUseCase {
    constructor(
        private jwtService: JwtService,
        private deviceRepository: DeviceRepository
    ) { }

    async execute(usedToken: string) {
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