import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/user.entity"
import { BlogEntity } from "./blog.entity"

@Entity()
export class BansUsersForBlogs {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    isBanned: boolean

    @Column()
    banReason: string

    @CreateDateColumn()
    banDate: Date

    @ManyToOne(() => UserEntity, (user) => user.bansForUser)
    @JoinColumn({ name: 'userId' })
    user: UserEntity

    @ManyToOne(() => BlogEntity, (blog) => blog.bansForBlog)
    @JoinColumn({ name: 'blogId' })
    blog: BlogEntity
}