import {
    createParamDecorator, ExecutionContext
} from "@nestjs/common"

export const CurrentDeviceId = createParamDecorator(
    (data: unknown, context: ExecutionContext): string => {
        const request = context.switchToHttp().getRequest()
        if (!request.user?.deviceId) throw new Error('RefreshAuthGuard must be used')
        return request.user.deviceId
    })