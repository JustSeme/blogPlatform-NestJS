import { ReadInputQuery } from "../../../general/types/ReadQuery"

export class ReadQuestionsQuery extends ReadInputQuery {
    constructor() {
        super()
    }

    bodySearchTerm: string
    publishedStatus: AllowedPublishedStatus
}

type AllowedPublishedStatus = 'all' | 'published' | 'notPublished'