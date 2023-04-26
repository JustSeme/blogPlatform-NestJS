import { v4 as uuidv4 } from "uuid"

export class BlogViewModel {
    public id: string
    public createdAt: string

    constructor(
        public name: string,
        public description: string,
        public websiteUrl: string,
        public isMembership: boolean,
    ) {
        this.id = uuidv4()
        this.createdAt = new Date().toISOString()
    }
}

export type BlogsWithQueryOutputModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: BlogViewModel[]
}