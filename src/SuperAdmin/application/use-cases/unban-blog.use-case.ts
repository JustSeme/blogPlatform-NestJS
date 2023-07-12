import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { BlogsTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostsTypeORMRepository } from "../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"
import { PostsQueryTypeORMRepository } from "../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"

export class UnbanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(UnbanBlogCommand)
export class UnbanBlogUseCase implements ICommandHandler<UnbanBlogCommand> {
    constructor(
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private blogsRepository: BlogsTypeORMRepository,
        private postsRepository: PostsTypeORMRepository,
        private postsQueryRepository: PostsQueryTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) { }


    async execute(command: UnbanBlogCommand): Promise<boolean> {

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        let savedBlog, savedPost

        try {
            const blogByBlogId = await this.blogsQueryRepository.findBlogById(command.blogId)

            blogByBlogId.banDate = null
            blogByBlogId.isBanned = false

            savedBlog = await this.blogsRepository.queryRunnerSave(blogByBlogId, queryRunner.manager)

            const postByBlogId = await this.postsQueryRepository.getPostByBlogId(command.blogId)

            postByBlogId.isBanned = false

            savedPost = await this.postsRepository.queryRunnerSave(postByBlogId, queryRunner.manager)

            await queryRunner.commitTransaction()
        } catch (err) {
            console.error(err)
            await queryRunner.rollbackTransaction()
            throw new Error('Something wrong with database, rollback unban blog transaction')
        } finally {
            await queryRunner.release()
        }

        return savedBlog && savedPost
    }
}