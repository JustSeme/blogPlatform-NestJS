import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/user.entity"
import { BlogEntity } from "../blogs/blog.entity"

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column()
    shortDescription: string

    @Column()
    content: string

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => BlogEntity, (blog) => blog.blogPosts)
    @JoinColumn({ name: 'blogId' })
    blog: BlogEntity

    @Column()
    blogName: string

    @Column({ default: false })
    isBanned: boolean

    @ManyToOne(() => UserEntity, (user) => user.userPosts)
    @JoinColumn({ name: 'ownerId' })
    user: UserEntity

    @Column()
    ownerLogin: string
}