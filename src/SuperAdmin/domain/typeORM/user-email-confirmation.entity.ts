import {
    Column,
    Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "./user.entity"

@Entity()
export class UserEmailConfirmation {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => UserEntity, (user) => user.emailConfirmation, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity

    @Column({ nullable: true })
    emailConfirmationCode: string

    @Column({ nullable: true })
    emailExpirationDate: Date

    @Column({ default: false })
    isEmailConfirmed: boolean
}