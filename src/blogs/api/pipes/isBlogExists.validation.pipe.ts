import {
    Injectable, NotFoundException, PipeTransform
} from "@nestjs/common"
import { BlogsRepository } from "../../infrastructure/blogs/blogs-db-repository"

@Injectable()
export class IsBlogByIdExistPipe implements PipeTransform {
    constructor(private blogsRepository: BlogsRepository) { }

    async transform(blogId: string): Promise<string> {
        if (!(await this.blogsRepository.isBlogExist(blogId))) {
            throw new NotFoundException([{
                message: 'blog by blogId parameter is not exists',
                field: 'blogId'
            }])
        }
        return blogId
    }

}