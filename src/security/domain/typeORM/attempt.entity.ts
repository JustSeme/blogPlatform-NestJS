import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from "typeorm"

@Entity()
export class AttemptEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column({
        nullable: false,
        default: 'undefined'
    })
    clientIp: string

    @Column({ nullable: false })
    requestedUrl: string

    @Column({ nullable: false })
    requestDate: Date
}