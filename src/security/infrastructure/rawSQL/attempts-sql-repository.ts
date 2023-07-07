import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

@Injectable()
export class AttemptsSQLRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    /* async getAttemptsCount(clientIp: string, requestedUrl: string, lastAttemptDate: Date): Promise<number> {
        const queryString = `
            SELECT count(*)
                FROM public."attempt_entity"
                WHERE "clientIp" = $1 AND "requestedUrl" = $2 AND "requestDate" > $3;
        `

        const data = await this.dataSource.query(queryString, [clientIp, requestedUrl, lastAttemptDate])

        return Number(data[0].count)
    } */

    async insertAttempt(clientIp: string, requestedUrl: string, requestDate: Date): Promise<boolean> {
        const queryString = `
            INSERT INTO public."attempt_entity"(
                "clientIp", "requestedUrl", "requestDate")
                VALUES ($1, $2, $3);
        `

        try {
            await this.dataSource.query(queryString, [clientIp, requestedUrl, requestDate])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async removeAttempts(clientIp: string, requestedUrl: string): Promise<boolean> {
        const queryString = `
            DELETE FROM public."attempt_entity"
                WHERE "clientIp" = $1 OR "requestedUrl" = $2;
        `

        try {
            await this.dataSource.query(queryString, [clientIp, requestedUrl])
            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }
}