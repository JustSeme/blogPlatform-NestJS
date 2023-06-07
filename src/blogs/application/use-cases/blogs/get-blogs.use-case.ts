import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { ReadBlogsQueryParams } from '../../../api/models/ReadBlogsQuery'
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from '../../dto/BlogViewModel'
import { NotFoundException } from '@nestjs/common'
import { BlogsQuerySQLRepository } from '../../../../Blogger/infrastructure/blogs/blogs-query-sql-repository'

export class GetBlogsCommand implements ICommand {
    constructor(public readonly blogsQueryParams: ReadBlogsQueryParams) { }
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
    constructor(
        private readonly blogsQueryRepository: BlogsQuerySQLRepository,
    ) { }

    async execute({ blogsQueryParams }: GetBlogsCommand): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsQueryRepository.findBlogs(blogsQueryParams)
        findedBlogsQueryData.items = findedBlogsQueryData.items.map(blog => new BlogViewModel(blog))

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }
}
