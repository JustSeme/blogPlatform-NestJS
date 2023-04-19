import { Model } from "mongoose"
import { Attempt } from "./AttemptsSchema"

export class AttemptDTO {
    constructor(
        public clientIp: string,
        public requestedUrl: string,
        public requestDate: Date,
    ) { }
}

export type AttemptModelType = Model<Attempt>
