import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { ReadBlogsQueryParams } from '../../../api/models/ReadBlogsQuery'
import { BlogsRepository } from '../../../infrastructure/blogs/blogs-db-repository'
import { BlogsService } from '../../blogs-service'
import { BlogsWithQueryOutputModel } from '../../dto/BlogViewModel'
import { NotFoundException } from '@nestjs/common'

export class GetBlogsCommand implements ICommand {
    constructor(public readonly blogsQueryParams: ReadBlogsQueryParams) { }
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly blogsService: BlogsService,
    ) { }

    async execute({ blogsQueryParams }: GetBlogsCommand): Promise<BlogsWithQueryOutputModel> {
        const findedBlogsQueryData = await this.blogsRepository.findBlogs(blogsQueryParams)
        findedBlogsQueryData.items = this.blogsService.prepareBlogForDisplay(findedBlogsQueryData.items)

        if (!findedBlogsQueryData.items.length) {
            throw new NotFoundException('No one blogs is founded')
        }

        return findedBlogsQueryData
    }
}
