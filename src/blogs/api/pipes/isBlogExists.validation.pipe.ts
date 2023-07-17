import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { generateErrorsMessages } from "../../../general/helpers/helpers"
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"

@Injectable()
export class IsBlogByIdExistPipe implements PipeTransform {
    constructor(private blogsQueryRepository: BlogsQueryTypeORMRepository) { }

    async transform(blogId: string): Promise<string> {
        if (!(await this.blogsQueryRepository.isBlogExists(blogId))) {
            throw new NotFoundException(generateErrorsMessages('blog by blogId parameter is not exists', 'blogId'))
        }
        return blogId
    }

}