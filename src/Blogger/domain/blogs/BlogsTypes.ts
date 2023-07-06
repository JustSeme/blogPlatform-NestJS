import { Model } from "mongoose"
import {
    Blog, BlogBanInfoType
} from "./mongoose/BlogsSchema"

export type BlogOwnerInfoType = {
    userId: string,
    userLogin: string
}

// data transfer object
export class BlogDTO {
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
            banDate: null
        }
        this.blogOwnerInfo = {
            userId,
            userLogin
        }
    }
}

export class BlogSQLModel {
    public id: string
    public name: string
    public description: string
    public websiteUrl: string
    public createdAt: Date
    public isMembership: boolean
    public ownerId: string
    public ownerLogin: string
    public isBanned: boolean
    public banDate: Date
}

export class BlogDBModel {
    public id: string
    public createdAt: Date
    public blogOwnerInfo: BlogOwnerInfoType
    public banInfo: BlogBanInfoType
    public name: string
    public description: string
    public websiteUrl: string
    public isMembership: boolean

    constructor(rawBlog: BlogSQLModel) {
        this.id = rawBlog.id
        this.createdAt = rawBlog.createdAt

        this.blogOwnerInfo = {
            userId: rawBlog.ownerId,
            userLogin: rawBlog.ownerLogin
        }

        this.banInfo = {
            isBanned: rawBlog.isBanned,
            banDate: rawBlog.banDate
        }

        this.name = rawBlog.name
        this.description = rawBlog.description
        this.websiteUrl = rawBlog.websiteUrl
        this.isMembership = rawBlog.isMembership
    }

}

export type BlogModelType = Model<Blog>