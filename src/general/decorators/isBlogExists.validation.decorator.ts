import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { BlogsQueryTypeORMRepository } from '../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository'

@ValidatorConstraint({
    name: 'IsBlogByIdExist', async: true
})
@Injectable()
export class IsBlogByIdExist implements ValidatorConstraintInterface {
    constructor(private blogsQueryRepository: BlogsQueryTypeORMRepository) { }

    async validate(blogId: string) {
        if (!(await this.blogsQueryRepository.isBlogExists(blogId))) {
            return false
        }
        return true
    }

    defaultMessage() {
        // here you can provide default error message if validation failed
        return 'Blog by blogId is not exists'
    }
}