import {
    Column,
    CreateDateColumn,
    Entity, PrimaryGeneratedColumn
} from "typeorm"

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

    @Column()
    blogId: string

    @Column()
    blogName: string

    @Column()
    ownerLogin: string

    @Column()
    ownerId: string

    @Column({ default: false })
    isBanned: boolean
}