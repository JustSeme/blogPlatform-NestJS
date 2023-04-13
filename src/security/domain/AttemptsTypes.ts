import { Model } from "mongoose"
import { Attempt } from "./AttemptsSchema"

export class AttemptsDBModel {
    constructor(
        public clientIp: string,
        public requestedUrl: string,
        public requestDate: Date
    ) {
        this.requestDate = new Date()
    }
}

export type AttemptModelType = Model<Attempt>