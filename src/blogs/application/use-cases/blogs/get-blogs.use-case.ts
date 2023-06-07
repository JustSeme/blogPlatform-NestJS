import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { ReadBlogsQueryParams } from '../../../api/models/ReadBlogsQuery'
import { BlogsRepository } from '../../../../Blogger/infrastructure/blogs/blogs-db-repository'
import {
    BlogViewModel, BlogsWithQueryOutputModel
} from '../../dto/BlogViewModel'
import { NotFoundException } from '@nestjs/common'

export class GetBlogsCommand implements ICommand {
    constructor(public readonly blogsQueryParams: ReadBlogsQueryParams) { }
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository,
    ) { }

    async execute({ blogsQueryParams }: GetBlogsCommand): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsRepository.findBlogs(blogsQueryParams)
        findedBlogsQueryData.items = findedBlogsQueryData.items.map(blog => new BlogViewModel(blog))

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }
}
