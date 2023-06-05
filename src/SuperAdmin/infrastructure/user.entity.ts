import { add } from "date-fns"
import {
    Column,
    Entity, PrimaryGeneratedColumn
} from "typeorm"
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string

    @Column({ nullable: false })
    login: string

    @Column({ nullable: false })
    email: string

    @Column({
        default: () => new Date(),
        nullable: false
    })
    createdAt: Date

    @Column({
        default: false,
        nullable: false
    })
    isBanned: boolean

    @Column({ default: null })
    banReason: string

    @Column({ default: null })
    banDate: Date

    @Column({ nullable: false })
    passwordHash: string

    @Column({ default: uuidv4 })
    emailConfirmationCode: string

    @Column({
        default: () => add(new Date(), {
            hours: 1,
            minutes: 3
        }),
    })
    emailExpirationDate: Date

    @Column({ default: false })
    isEmailConfirmed: boolean

    @Column({ default: uuidv4 })
    passwordRecoveryConfirmationCode: string

    @Column({
        default: () => add(new Date(), {
            hours: 1,
            minutes: 3
        }),
    })
    passwordRecoveryExpirationDate: Date
}