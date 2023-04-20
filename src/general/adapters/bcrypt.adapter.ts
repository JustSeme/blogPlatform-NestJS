import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common/decorators'

@Injectable()
export class BcryptAdapter {
    async generatePasswordHash(password: string, rounds: number) {
        return bcrypt.hash(password, rounds)
    }

    async comparePassword(password: string, passwordHash: string) {
        return bcrypt.compare(password, passwordHash)
    }
}