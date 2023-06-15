import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { CommentLikesInfo } from "./comment-likes-info.entity"
import { CommentPostInfo } from "./comment-post-info.entity"

@Entity()
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    content: string

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => UserEntity, (user) => user.comments)
    @JoinColumn({ name: 'commentatorId' })
    commentatorId: UserEntity

    @Column()
    commentatorLogin: string

    @OneToOne(() => CommentPostInfo, (commentPostInfo) => commentPostInfo.comment)
    postInfo: CommentPostInfo

    @OneToMany(() => CommentLikesInfo, (likesInfo) => likesInfo.comment)
    commentLikes: CommentLikesInfo[]
}