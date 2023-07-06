import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { BanBlogInputModel } from "../../api/models/BanBlogInputModel"
import { PostsSQLRepository } from "../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { BlogsTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-typeORM-repository"
import { BlogsQueryTypeORMRepository } from "../../../Blogger/infrastructure/blogs/typeORM/blogs-query-typeORM-repository"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

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
        private postsRepository: PostsSQLRepository,
        @InjectDataSource() private dataSource: DataSource,
    ) { }


    async execute(command: BanBlogCommand): Promise<boolean> {

        const queryRunner = this.dataSource.createQueryRunner()

        await queryRunner.connect()

        await queryRunner.startTransaction()

        let savedBlog, isHided

        try {
            const blogByBlogId = await this.blogsQueryRepository.findBlogById(command.blogId)

            blogByBlogId.banDate = new Date()
            blogByBlogId.isBanned = true

            savedBlog = await this.blogsRepository.dataSourceSave(blogByBlogId)

            isHided = await this.postsRepository.hidePostsByBlogId(command.blogId)

            await queryRunner.commitTransaction()
        } catch (err) {
            console.error(err)
            await queryRunner.rollbackTransaction()
            throw new Error('Something wrong with database, rollback ban blog transaction')
        } finally {
            await queryRunner.release()
        }


        return savedBlog && isHided
    }
}