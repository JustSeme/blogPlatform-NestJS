import { Injectable } from '@nestjs/common'
import dotenv from 'dotenv'

dotenv.config()

@Injectable()
export class Settings {
    public readonly mongoURI: string
    public readonly JWT_SECRET: string
    public readonly PORT: number
    public readonly GMAIL_LOGIN: string
    public readonly GMAIL_APP_PASSWORD: string
    public readonly SA_LOGIN: string
    public readonly SA_PASSWORD: string
    public readonly ACCESS_TOKEN_EXPIRE_TIME: string
    public readonly REFRESH_TOKEN_EXPIRE_TIME: string

    constructor() {
        this.mongoURI = process.env.mongoURI
        this.JWT_SECRET = process.env.JWT_SECRET
        this.PORT = parseInt(process.env.PORT || '3000', 10)
        this.GMAIL_LOGIN = process.env.GMAIL_LOGIN
        this.GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
        this.SA_LOGIN = process.env.SA_LOGIN
        this.SA_PASSWORD = process.env.SA_PASSWORD
        this.ACCESS_TOKEN_EXPIRE_TIME = '10s'
        this.REFRESH_TOKEN_EXPIRE_TIME = '20s'
    }
}