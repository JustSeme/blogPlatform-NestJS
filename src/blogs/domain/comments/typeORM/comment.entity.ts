import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../../SuperAdmin/domain/typeORM/user.entity"
import { CommentPostInfoEntity } from "./comment-post-info.entity"

@Entity()
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    content: string

    @CreateDateColumn()
    createdAt: Date

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => UserEntity, (user) => user.comments)
    @JoinColumn({ name: 'commentatorId' })
    user: UserEntity

    @Column()
    commentatorLogin: string

    @OneToOne(() => CommentPostInfoEntity, (commentPostInfo) => commentPostInfo.comment)
    postInfo: CommentPostInfoEntity
}