import {
    ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus
} from '@nestjs/common'
import {
    Request, Response
} from 'express'

@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        if (process.env.ENV_VARIABLE !== 'production') {
            const responsedError = {
                message: exception.message.toString(),
                stack: exception.stack.toString()
            }
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(responsedError)
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('some error occured')
        }
    }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        const status = exception.getStatus()

        if (status === HttpStatus.BAD_REQUEST) {
            const exceptionBody: any = exception.getResponse()
            console.log(exceptionBody)


            response
                .status(status)
                .json({ errorsMessages: exceptionBody.message })
        } else {
            response
                .status(status)
                .json({
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                })
        }
    }
}