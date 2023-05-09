import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { BlogsRepository } from '../../Blogger/infrastructure/blogs/blogs-db-repository'

@ValidatorConstraint({
    name: 'IsBlogByIdExist', async: true
})
@Injectable()
export class IsBlogByIdExist implements ValidatorConstraintInterface {
    constructor(private blogsRepository: BlogsRepository) { }

    async validate(blogId: string) {
        if (!(await this.blogsRepository.isBlogExist(blogId))) {
            return false
        }
        return true
    }

    defaultMessage() {
        // here you can provide default error message if validation failed
        return 'Blog by blogId is not exists'
    }
}