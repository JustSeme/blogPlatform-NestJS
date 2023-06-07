import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { BlogViewModel } from '../../dto/BlogViewModel'
import { NotFoundException } from '@nestjs/common'
import { generateErrorsMessages } from '../../../../general/helpers'
import { BlogsSQLRepository } from '../../../../Blogger/infrastructure/blogs/blogs-sql-repository'

export class GetBlogByIdCommand implements ICommand {
    constructor(public readonly blogId: string) { }
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
    constructor(
        private readonly blogsRepository: BlogsSQLRepository,
    ) { }

    async execute({ blogId }: GetBlogByIdCommand): Promise<BlogViewModel> {
        const findedBlog = await this.blogsRepository.findBlogById(blogId)

        if (findedBlog.banInfo.isBanned) {
            throw new NotFoundException(generateErrorsMessages('This blog is banned', 'blogId'))
        }
        return new BlogViewModel(findedBlog)
    }
}
