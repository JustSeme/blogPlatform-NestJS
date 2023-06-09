import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/user.entity"

@Entity()
export class BlogEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    websiteUrl: string

    @CreateDateColumn()
    createdAt: Date

    @Column({ default: true })
    isMembership: boolean

    @Column()
    ownerLogin: string

    @Column({ default: false })
    isBanned: boolean

    @Column({ default: null })
    banDate: Date

    @ManyToOne(() => UserEntity, (user) => user.userBlogs)
    @JoinColumn({ name: 'ownerId' })
    user: UserEntity
}