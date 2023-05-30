import { Injectable } from "@nestjs/common/decorators"
import { DataSource } from "typeorm"
import { UserViewModelType } from "../application/dto/UsersViewModel"
import { UserSQLModel } from "./UsersTypes"

@Injectable()
export class UsersQuerySQLRepository {
    constructor(
        private dataSource: DataSource
    ) { }

    async findUserById(userId: string): Promise<UserViewModelType> {
        const queryString = `
            SELECT *
                FROM public."Users"
                WHERE id = $1;
        `

        const findedUserData: UserSQLModel = await this.dataSource.query(queryString, [userId])[0]

        return new UserViewModelType(findedUserData)
    }
}