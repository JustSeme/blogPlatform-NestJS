import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers"
import { BlogsSQLRepository } from "../../../Blogger/infrastructure/blogs/blogs-sql-repository"

@Injectable()
export class IsBlogByIdExistPipe implements PipeTransform {
    constructor(private blogsRepository: BlogsSQLRepository) { }

    async transform(blogId: string): Promise<string> {
        if (!(await this.blogsRepository.isBlogExists(blogId))) {
            throw new NotFoundException(generateErrorsMessages('blog by blogId parameter is not exists', 'blogId'))
        }
        return blogId
    }

}