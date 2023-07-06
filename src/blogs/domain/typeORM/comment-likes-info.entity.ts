import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { CommentEntity } from "./comment.entity"

@Entity()
export class CommentLikesInfo {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => UserEntity, (user) => user.commentsLikeEntities)
    @JoinColumn({ name: 'userId' })
    user: UserEntity

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column({ default: false })
    isBanned: boolean

    @Column({ default: 'None' })
    likeStatus: string

    @ManyToOne(() => CommentEntity, (comment) => comment.commentLikes)
    @JoinColumn({ name: 'commentId' })
    comment: CommentEntity
}