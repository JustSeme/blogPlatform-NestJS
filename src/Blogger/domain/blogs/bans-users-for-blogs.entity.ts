import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/user.entity"

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

    @ManyToOne(() => UserEntity, (user) => user.bansForBlog)
    @JoinColumn({ name: 'userId' })
    user: UserEntity
}