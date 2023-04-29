import {
    BadRequestException,
    Injectable, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { BlogsRepository } from "../../../blogs/infrastructure/blogs/blogs-db-repository"

@Injectable()
export class IsBlogExistOrThrow400Pipe implements PipeTransform {
    constructor(private blogsRepository: BlogsRepository) { }

    async transform(blogId: string): Promise<string> {
        if (!(await this.blogsRepository.isBlogExist(blogId))) {
            throw new BadRequestException(generateErrorsMessages('blog by blogId parameter is not exists', 'blogId'))
        }
        return blogId
    }

}