import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../../SuperAdmin/domain/typeORM/user.entity"
import { Repository } from "typeorm"
import { UserPasswordRecovery } from "../../../SuperAdmin/domain/typeORM/user-password-recovery.entity"

@Injectable()
export class AuthQueryTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
        @InjectRepository(UserPasswordRecovery)
        private usersPasswordRecoveryRepository: Repository<UserPasswordRecovery>,
    ) { }

    async isUserByLoginExists(userLogin: string): Promise<boolean> {
        try {
            const userByLogin = await this.usersRepository.findOne({ where: { login: userLogin } })

            return userByLogin ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }

    async isUserByEmailExists(userEmail: string): Promise<boolean> {
        try {
            const userByEmail = await this.usersRepository.findOne({ where: { email: userEmail } })

            return userByEmail ? true : false
        } catch (err) {
            console.error(err)
            return false
        }
    }
}