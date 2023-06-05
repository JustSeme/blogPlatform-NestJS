import {
    Injectable, NestMiddleware
} from '@nestjs/common'
import {
    Request, Response, NextFunction
} from 'express'
import heapdump from 'heapdump'

export const handleUserRequest = (req) => {
    heapdump.writeSnapshot(
        `1.User_Request_Received-${Date.now()}.heapsnapshot`,
        (err, filename) => {
            console.log('dump written to', filename)
        })
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Request...')
        handleUserRequest(req)
        next()
    }
}

