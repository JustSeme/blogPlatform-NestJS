import { Model } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import { Blog } from "./BlogsSchema"

export type BlogOwnerInfoType = {
    userId: string,
    userLogin: string
}

export type BlogBanInfoType = {
    isBanned: boolean
    banDate: Date
}

// data transfer object
export class BlogDBModel {
    public id: string
    public createdAt: string
    public blogOwnerInfo: BlogOwnerInfoType
    public banInfo: BlogBanInfoType

    constructor(
        public name: string,
        public description: string,
        public websiteUrl: string,
        public isMembership: boolean,
        userLogin: string,
        userId: string,
    ) {
        this.banInfo = {
            isBanned: false,
            banDate: new Date()
        }
        this.blogOwnerInfo = {
            userId,
            userLogin
        }
        this.id = uuidv4()
        this.createdAt = new Date().toISOString()
    }
}

export type BlogModelType = Model<Blog>