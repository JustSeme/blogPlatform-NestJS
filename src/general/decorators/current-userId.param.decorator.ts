import {
    createParamDecorator, ExecutionContext
} from "@nestjs/common"

export const CurrentUserId = createParamDecorator(
    (data: unknown, context: ExecutionContext): string => {
        const request = context.switchToHttp().getRequest()
        if (!request.user?.userId) return null
        return request.user.userId
    })