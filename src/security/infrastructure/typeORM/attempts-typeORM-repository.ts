import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { AttemptEntity } from "../../domain/typeORM/attempt.entity"
import { Repository } from "typeorm"

@Injectable()
export class AttemptsTypeORMRepository {
    constructor(
        @InjectRepository(AttemptEntity)
        private attemptsRepository: Repository<AttemptEntity>
    ) { }

    async getAttemptsCount(clientIp: string, requestedUrl: string, lastAttemptDate: Date): Promise<number> {
        try {
            const attemptsCount = await this.attemptsRepository
                .createQueryBuilder('a')
                .where('a.clientIp = :clientIp', { clientIp })
                .andWhere('a.requestedUrl = :requestedUrl', { requestedUrl })
                .andWhere('a.requestDate > :lastAttemptDate', { lastAttemptDate })
                .getCount()

            return attemptsCount ? attemptsCount : null
        } catch (err) {
            console.log(err, 'get')
            console.error(err)
            throw new Error('Something wrong with database, try again')
        }
    }

    async insertAttempt(clientIp: string, requestedUrl: string, requestDate: Date): Promise<boolean> {
        try {
            const newAttempt = new AttemptEntity()
            newAttempt.clientIp = clientIp
            newAttempt.requestedUrl = requestedUrl
            newAttempt.requestDate = requestDate

            const createdAttempt = await this.attemptsRepository.save(newAttempt)
            return createdAttempt ? true : false
        } catch (err) {
            console.log(err, 'insert')
            console.error(err)
            return false
        }
    }

    async removeAttempts(clientIp: string, requestedUrl: string): Promise<boolean> {
        try {
            const deleteResult = await this.attemptsRepository
                .createQueryBuilder('a')
                .where('clientIp = :clientIp', { clientIp })
                .andWhere('requestedUrl = :requestedUrl', { requestedUrl })
                .delete()
                .execute()

            return deleteResult ? true : false
        } catch (err) {
            console.log(err, 'delete')
            console.error(err)
            return false
        }
    }
}