import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserEntity } from "../../SuperAdmin/domain/typeORM/user.entity"
import { Repository } from "typeorm"

@Injectable()
export class AuthTypeORMRepository {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>
    ) { }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserEntity> {
        return this.usersRepository
            .createQueryBuilder('u')
            .where('u.login = :loginOrEmail', { loginOrEmail })
            .orWhere('u.email = :loginOrEmail', { loginOrEmail })
            .getOne()
    }
}