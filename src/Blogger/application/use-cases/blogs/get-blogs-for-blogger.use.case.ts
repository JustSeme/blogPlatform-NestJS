import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { ReadBlogsQueryParams } from '../../../../blogs/api/models/ReadBlogsQuery'
import { BlogsRepository } from '../../../infrastructure/blogs/blogs-db-repository'
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from '../../../../blogs/application/dto/BlogViewModel'

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
    ) { }

    async execute({
        blogsQueryParams,
        bloggerId
    }: GetBlogsForBloggerCommand): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsRepository.findBlogs(blogsQueryParams, bloggerId)
        findedBlogsQueryData.items = findedBlogsQueryData.items.map(blog => new BlogViewModel(blog))

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }
}
