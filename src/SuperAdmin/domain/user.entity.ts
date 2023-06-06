import {
    Column,
    CreateDateColumn,
    Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm"
import { AuthSession } from "../../security/domain/auth-session.entity"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    login: string

    @Column({ nullable: false })
    email: string

    @CreateDateColumn({ nullable: false })
    createdAt: Date

    @Column({
        default: false,
        nullable: false
    })
    isBanned: boolean

    @Column({ default: null, })
    banReason: string

    @Column({
        type: 'timestamptz',
        default: null,
        nullable: true
    })
    banDate: Date

    @Column({ nullable: false })
    passwordHash: string

    @Column()
    emailConfirmationCode: string

    @Column()
    emailExpirationDate: Date

    @Column({ default: false })
    isEmailConfirmed: boolean

    @Column({ default: null })
    passwordRecoveryConfirmationCode: string

    @Column({ default: null })
    passwordRecoveryExpirationDate: Date

    @OneToMany(() => AuthSession, (authSession) => authSession.user)
    authSessions: AuthSession[]
}