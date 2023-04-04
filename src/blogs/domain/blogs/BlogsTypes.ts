import { Model } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { Blog } from "./BlogsSchema"

// data transfer object
export class BlogDBModel {
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

export type BlogModelType = Model<Blog>