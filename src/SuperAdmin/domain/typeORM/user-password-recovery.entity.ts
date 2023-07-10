import {
    Column,
    Entity, OneToOne, PrimaryGeneratedColumn
} from "typeorm"
import { UserEntity } from "./user.entity"

@Entity()
export class UserPasswordRecovery {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => UserEntity, (user) => user.emailConfirmation, { onDelete: "CASCADE" })
    user: UserEntity

    @Column({ default: null })
    passwordRecoveryConfirmationCode: string

    @Column({ default: null })
    passwordRecoveryExpirationDate: Date
}