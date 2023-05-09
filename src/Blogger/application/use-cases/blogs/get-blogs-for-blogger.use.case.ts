import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { ReadBlogsQueryParams } from '../../../../blogs/api/models/ReadBlogsQuery'
import { BlogsRepository } from '../../../infrastructure/blogs/blogs-db-repository'
import { BlogsService } from '../../../../blogs/application/blogs-service'
import { BlogsWithQueryOutputModel } from '../../../../blogs/application/dto/BlogViewModel'

export class GetBlogsForBloggerCommand implements ICommand {
    constructor(
        public readonly blogsQueryParams: ReadBlogsQueryParams,
        public bloggerId: string
    ) { }
}

@CommandHandler(GetBlogsForBloggerCommand)
export class GetBlogsForBloggerUseCase implements ICommandHandler<GetBlogsForBloggerCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly blogsService: BlogsService,
    ) { }

    async execute({
        blogsQueryParams,
        bloggerId
    }: GetBlogsForBloggerCommand): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsRepository.findBlogs(blogsQueryParams, bloggerId)
        findedBlogsQueryData.items = this.blogsService.prepareBlogForDisplay(findedBlogsQueryData.items)

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }
}
