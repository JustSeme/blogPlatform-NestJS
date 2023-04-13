import { InjectModel } from "@nestjs/mongoose"
import { Attempt } from "../domain/AttemptsSchema"
import { AttemptModelType } from "../domain/AttemptsTypes"


export class AttemptsRepository {
    constructor(@InjectModel(Attempt.name) private AttemptModel: AttemptModelType) { }

    async getAttemptsCount(clientIp: string, requestedUrl: string, lastAttemptDate: Date) {
        return this.AttemptModel.countDocuments({
            clientIp,
            requestedUrl,
            requestDate: { $gt: lastAttemptDate }
        })
    }

    async insertAttempt(clientIp: string, requestedUrl: string, requestDate: Date) {
        const result = await this.AttemptModel.create({
            clientIp, requestedUrl, requestDate
        })
        return result ? true : false
    }

    async removeAttempts(clientIp: string, requestedUrl: string) {
        const result = await this.AttemptModel.deleteMany({
            clientIp, requestedUrl
        })
        return result.deletedCount > 0
    }
}