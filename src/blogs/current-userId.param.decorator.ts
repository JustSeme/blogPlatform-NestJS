import {
    createParamDecorator, ExecutionContext
} from "@nestjs/common"

export const CurrentUserId = createParamDecorator(
    (data: unknown, context: ExecutionContext): string => {
        const request = context.switchToHttp().getRequest()
        if (!request.user) throw new Error('AuthGuard must be used')
        return request.user.id
    })