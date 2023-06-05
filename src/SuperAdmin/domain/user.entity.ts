import {
    Column,
    Entity, PrimaryGeneratedColumn
} from "typeorm"

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column({ nullable: false })
    login: string

    @Column({ nullable: false })
    email: string

    @Column({ nullable: false })
    createdAt: Date

    @Column({
        default: false,
        nullable: false
    })
    isBanned: boolean

    @Column({ default: null, })
    banReason: string

    @Column({ default: null })
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
}