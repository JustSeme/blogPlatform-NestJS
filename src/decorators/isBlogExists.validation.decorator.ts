import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { BlogsQueryRepository } from 'src/blogs/infrastructure/blogs/blogs-query-repository'

@ValidatorConstraint({
    name: 'IsBlogByIdExist', async: true
})
@Injectable()
export class IsBlogByIdExist implements ValidatorConstraintInterface {
    constructor(private blogsQueryRepository: BlogsQueryRepository) { }

    async validate(blogId: string) {
        /* const blogId = args.object.blogId */

        const blogById = await this.blogsQueryRepository.findBlogById(blogId)

        if (!blogById) {
            return false
        }
        return true
    }

    defaultMessage() {
        // here you can provide default error message if validation failed
        return 'blog by blogId is not exist'
    }
}