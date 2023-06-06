import {
    Column,
    Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "../../SuperAdmin/domain/user.entity"

@Entity()
export class AuthSession {
    @PrimaryGeneratedColumn('uuid')
    deviceId: string

    @Column({ nullable: false })
    deviceName: string

    @ManyToOne(
        () => UserEntity,
        (user) => user.authSessions
    )
    user: UserEntity

    @Column({ nullable: false })
    userIp: string

    @Column({ nullable: false })
    issuedAt: number

    @Column({ nullable: false })
    expireDate: number
}