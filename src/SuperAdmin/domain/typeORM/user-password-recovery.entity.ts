import {
    Column,
    Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "./user.entity"

@Entity()
export class UserPasswordRecovery {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => UserEntity, (user) => user.emailConfirmation, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'userId' })
    user: UserEntity

    @Column({ default: null })
    passwordRecoveryConfirmationCode: string

    @Column({ default: null })
    passwordRecoveryExpirationDate: Date
}