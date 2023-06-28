import { Injectable } from '@nestjs/common'
import {
    ValidatorConstraint, ValidatorConstraintInterface
} from 'class-validator'
import { BlogsSQLRepository } from '../../Blogger/infrastructure/blogs/rawSQL/blogs-sql-repository'

@ValidatorConstraint({
    name: 'IsBlogByIdExist', async: true
})
@Injectable()
export class IsBlogByIdExist implements ValidatorConstraintInterface {
    constructor(private blogsRepository: BlogsSQLRepository) { }

    async validate(blogId: string) {
        if (!(await this.blogsRepository.isBlogExists(blogId))) {
            return false
        }
        return true
    }

    defaultMessage() {
        // here you can provide default error message if validation failed
        return 'Blog by blogId is not exists'
    }
}