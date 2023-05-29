import { InjectDataSource } from '@nestjs/typeorm'
import { Injectable } from "@nestjs/common"
import { DataSource } from 'typeorm'


@Injectable()
export class AuthRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) { }


}