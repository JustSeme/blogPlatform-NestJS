import { InjectModel } from "@nestjs/mongoose"

import { Blog } from "../../domain/blogs/BlogsSchema"
import { BlogModelType } from "../../domain/blogs/BlogsTypes"
import { Injectable } from '@nestjs/common'

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private BlogsModel: BlogModelType) { }
}