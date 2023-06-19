import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { PostEntity } from "./post.entity"

@Entity()
export class PostLikesInfo {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => UserEntity, (user) => user.postLikeEntities)
    @JoinColumn({ name: 'userId' })
    userId: UserEntity

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column()
    ownerLogin: string

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => PostEntity, (post) => post.postLikeEntities)
    @JoinColumn({ name: 'postId' })
    postId: PostEntity
}