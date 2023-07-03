import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { PostEntity } from "../../../domain/posts/typeORM/post.entity"
import { Repository } from "typeorm"

@Injectable()
export class PostsQueryTypeORMRepository {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepostiory: Repository<PostEntity>
    ) { }

    async getPostById(postId: string): Promise<PostEntity> {
        try {
            return this.postsRepostiory.findOneOrFail({ where: { id: postId } })
        } catch (err) {
            console.error(err)
            return null
        }
    }
}