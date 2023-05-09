import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { BlogsRepository } from "../../../Blogger/infrastructure/blogs/blogs-db-repository"
import { generateErrorsMessages } from "../../../general/helpers"

@Injectable()
export class IsBlogByIdExistPipe implements PipeTransform {
    constructor(private blogsRepository: BlogsRepository) { }

    async transform(blogId: string): Promise<string> {
        if (!(await this.blogsRepository.isBlogExist(blogId))) {
            throw new NotFoundException(generateErrorsMessages('blog by blogId parameter is not exists', 'blogId'))
        }
        return blogId
    }

}