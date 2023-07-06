import {
    Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus
} from '@nestjs/common'
import { AttemptsSQLRepository } from '../../../security/infrastructure/rawSQL/attempts-sql-repository'


const rateLimitValidation = async (clientIp: string, requestedUrl: string, attemptsRepository: AttemptsSQLRepository) => {
    const interval = 10 * 1000
    const currentDate = new Date()
    const lastAttemptDate = new Date(currentDate.getTime() - interval)

    const attemptsCount = await attemptsRepository.getAttemptsCount(clientIp, requestedUrl, lastAttemptDate)

    await attemptsRepository.insertAttempt(clientIp, requestedUrl, currentDate)

    if (attemptsCount >= (5 + 1000)) {
        return false
    }

    setTimeout(async () => {
        await attemptsRepository.removeAttempts(clientIp, requestedUrl)
    }, 10000)
    return true
}

@Injectable()
export class IpRestrictionGuard implements CanActivate {
    constructor(private attemptsRepository: AttemptsSQLRepository) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const clientIp = request.ip
        const requestedUrl = request.url

        if (!(await rateLimitValidation(clientIp, requestedUrl, this.attemptsRepository))) {
            throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS)
        }
        return true
    }
}