import {
    Column,
    Entity, PrimaryGeneratedColumn
} from "typeorm"

@Entity()
export class AuthSession {
    @PrimaryGeneratedColumn()
    deviceId: string

    @Column({ nullable: false })
    deviceName: string

    @Column({ nullable: false })
    userId: string

    @Column({ nullable: false })
    userIp: string

    @Column({ nullable: false })
    issuedAt: number

    @Column({ nullable: false })
    expireDate: number
}