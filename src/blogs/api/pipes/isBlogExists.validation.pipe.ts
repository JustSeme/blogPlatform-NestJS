import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { BlogsQueryRepository } from "src/blogs/infrastructure/blogs/blogs-query-repository"

@Injectable()
export class IsBlogByIdExistPipe implements PipeTransform {
    constructor(private blogsQueryRepository: BlogsQueryRepository) { }

    async transform(blogId: string): Promise<string> {
        if (!(await this.blogsQueryRepository.isBlogExist(blogId))) {
            throw new NotFoundException([{
                message: 'blog by blogId parameter is not exists',
                field: 'blogId'
            }])
        }
        return blogId
    }

}