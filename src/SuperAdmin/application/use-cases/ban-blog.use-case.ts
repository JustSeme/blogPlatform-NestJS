import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { BlogsTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { PostsTypeORMRepository } from "../../../Blogger/infrastructure/posts/typeORM/posts-typeORM-repository"
import { PostsQueryTypeORMRepository } from "../../../Blogger/infrastructure/posts/typeORM/posts-query-typeORM-repository"

export class BanBlogCommand {
    constructor(
        public readonly banInputModel: BanBlogInputModel,
        public readonly blogId: string,
    ) { }
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
    constructor(
        private blogsRepository: BlogsTypeORMRepository,
        private blogsQueryRepository: BlogsQueryTypeORMRepository,
        private postsRepository: PostsTypeORMRepository,
        private postsQueryRepository: PostsQueryTypeORMRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) { }


    async execute(command: BanBlogCommand): Promise<boolean> {

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        let savedBlog, isPostsHided

        try {
            const blogByBlogId = await this.blogsQueryRepository.findBlogById(command.blogId)

            blogByBlogId.banDate = new Date()
            blogByBlogId.isBanned = true

            savedBlog = await this.blogsRepository.queryRunnerSave(blogByBlogId, queryRunner.manager)

            isPostsHided = await this.postsRepository.hidePostsForBlog(command.blogId)

            if (!savedBlog && isPostsHided) {
                throw new Error('Blog is not saved or posts is not hided, rollback transaction')
            }

            await queryRunner.commitTransaction()
        } catch (err) {
            console.error(err)
            await queryRunner.rollbackTransaction()
            throw new Error(err)
        } finally {
            await queryRunner.release()
        }

        return savedBlog && isPostsHided
    }
}