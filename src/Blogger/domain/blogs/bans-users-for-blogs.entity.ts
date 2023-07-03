import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { BlogEntity } from "./blog.entity"

@Entity()
export class BansUsersForBlogs {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    isBanned: boolean

    @Column()
    banReason: string

    @CreateDateColumn({ type: 'timestamptz' })
    banDate: Date

    @ManyToOne(() => UserEntity, (user) => user.bansForUser)
    @JoinColumn({ name: 'userId' })
    user: UserEntity | string

    @ManyToOne(() => BlogEntity, (blog) => blog.bansForBlog)
    @JoinColumn({ name: 'blogId' })
    blogId: BlogEntity | string
}