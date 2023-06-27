import {
    Column,
    Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../SuperAdmin/domain/typeORM/user.entity"

@Entity()
export class AuthSession {
    @PrimaryGeneratedColumn('uuid')
    deviceId: string

    @Column({ nullable: false })
    deviceName: string

    @ManyToOne(
        () => UserEntity,
        (user) => user.authSessions,
        { onDelete: 'CASCADE' }
    )
    user: UserEntity

    @Column({ nullable: false })
    userIp: string

    @Column({ nullable: false })
    issuedAt: number

    @Column({ nullable: false })
    expireDate: number
}