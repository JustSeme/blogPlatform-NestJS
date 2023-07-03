import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs"
import { PostsViewModel } from "../../dto/PostViewModel"
import { NotFoundException } from '@nestjs/common'
import { PostsSQLRepository } from "../../../../Blogger/infrastructure/posts/rawSQL/posts-sql-repository"
import { JwtService } from "../../../../general/adapters/jwt.adapter"

export class GetPostByIdCommand {
    constructor(
        public readonly postId: string,
        public readonly authorizationHeader: string,
    ) { }
}


@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
    constructor(
        private readonly postsRepository: PostsSQLRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute(query: GetPostByIdCommand): Promise<PostsViewModel> {
        const accessToken = query.authorizationHeader ? query.authorizationHeader.split(' ')[1] : null

        const userId = await this.jwtService.getCorrectUserIdByAccessToken(accessToken)

        const findedPost = await this.postsRepository.getPostByIdWithLikesInfo(query.postId, userId)

        if (!findedPost) {
            throw new NotFoundException('blog by this post is banned')
        }

        return findedPost
    }
}
