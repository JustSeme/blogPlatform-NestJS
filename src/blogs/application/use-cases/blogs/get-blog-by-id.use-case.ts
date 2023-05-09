import {
    CommandHandler, ICommand, ICommandHandler
} from '@nestjs/cqrs'
import { BlogsRepository } from '../../../../Blogger/infrastructure/blogs/blogs-db-repository'
import { BlogsService } from '../../blogs-service'
import { BlogViewModel } from '../../dto/BlogViewModel'

export class GetBlogByIdCommand implements ICommand {
    constructor(public readonly blogId: string) { }
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
    constructor(
        private readonly blogsRepository: BlogsRepository,
        private readonly blogsService: BlogsService,
    ) { }

    async execute({ blogId }: GetBlogByIdCommand): Promise<BlogViewModel> {
        const findedBlog = await this.blogsRepository.findBlogById(blogId)
        return this.blogsService.prepareBlogForDisplay([findedBlog])[0]
    }
}
