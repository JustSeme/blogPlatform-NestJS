import {
    Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus
} from '@nestjs/common'
import { AttemptsTypeORMRepository } from '../../../security/infrastructure/typeORM/attempts-typeORM-repository'

@Injectable()
export class IpRestrictionGuard implements CanActivate {
    constructor(private attemptsRepository: AttemptsTypeORMRepository) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const clientIp = request.ip
        const requestedUrl = request.url

        if (!(await this.rateLimitValidation(clientIp, requestedUrl))) {
            throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS)
        }
        return true
    }

    async rateLimitValidation(clientIp: string, requestedUrl: string) {
        const interval = 10 * 1000
        const currentDate = new Date()
        const lastAttemptDate = new Date(currentDate.getTime() - interval)

        const attemptsCount = await this.attemptsRepository.getAttemptsCount(clientIp, requestedUrl, lastAttemptDate)

        await this.attemptsRepository.insertAttempt(clientIp, requestedUrl, currentDate)

        if (attemptsCount >= (5 + 1000)) {
            return false
        }

        setTimeout(async () => {
            await this.attemptsRepository.removeAttempts(clientIp, requestedUrl)
        }, 10000)
        return true
    }
}