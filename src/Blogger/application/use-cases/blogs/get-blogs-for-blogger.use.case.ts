import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { ReadBlogsQueryParams } from '../../../../blogs/api/models/ReadBlogsQuery'
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from '../../../../blogs/application/dto/BlogViewModel'
import { BlogsQuerySQLRepository } from '../../../infrastructure/blogs/blogs-query-sql-repository'

export class GetBlogsForBloggerCommand implements ICommand {
    constructor(
        public readonly blogsQueryParams: ReadBlogsQueryParams,
        public bloggerId: string
    ) { }
}

@CommandHandler(GetBlogsForBloggerCommand)
export class GetBlogsForBloggerUseCase implements ICommandHandler<GetBlogsForBloggerCommand> {
    constructor(
        private readonly blogsQueryRepository: BlogsQuerySQLRepository,
    ) { }

    async execute({
        blogsQueryParams,
        bloggerId
    }: GetBlogsForBloggerCommand): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsQueryRepository.findBlogsForBlogger(blogsQueryParams, bloggerId)
        findedBlogsQueryData.items = findedBlogsQueryData.items.map(blog => new BlogViewModel(blog))

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }
}
