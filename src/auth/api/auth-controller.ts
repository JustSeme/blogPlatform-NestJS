import {
    BadRequestException,
    Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, Request, Response, UnauthorizedException, UseGuards
} from "@nestjs/common"
import { AuthService } from "../application/auth-service"
import { UserInputModel } from "./models/UserInputModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import { NewPasswordInputModel } from "./models/NewPasswordInputModel"
import { MeOutputModel } from "../application/dto/MeViewModel"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import {
    Throttle, ThrottlerGuard
} from "@nestjs/throttler"
import {
    ErrorMessagesOutputModel, FieldError
} from "../../general/types/ErrorMessagesOutputModel"
import { JwtAuthGuard } from "../../blogs/api/guards/jwt-auth.guard"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { JwtService } from "../../general/adapters/JwtService"

@Controller('auth')
export class AuthController {
    constructor(protected authService: AuthService, protected jwtService: JwtService, protected usersQueryRepository: UsersQueryRepository) { }

    @UseGuards(ThrottlerGuard)
    @UseGuards(LocalAuthGuard)
    @Throttle(5, 10)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Request() req,
        @Response() res,
    ) {
        const deviceName = req.headers["user-agent"] ? req.headers["user-agent"] : 'undefined'

        const pairOfTokens = await this.authService.login(req.user.id, req.ip, deviceName)

        res.cookie('refreshToken', pairOfTokens.refreshToken, {
            httpOnly: true,
            secure: true,
        })

        res.send({ accessToken: pairOfTokens.accessToken })
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Request() req, @Response() res) {
        const refreshToken = req.cookies.refreshToken

        const newTokens = await this.jwtService.refreshTokens(refreshToken)

        if (!newTokens) {
            throw new UnauthorizedException()
        }

        res.cookie('refreshToken', newTokens.newRefreshToken, {
            httpOnly: true,
            secure: true,
        })

        res.send({ accessToken: newTokens.newAccessToken })
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Request() req) {
        const refreshToken = req.cookies.refreshToken

        const isLogout = await this.authService.logout(refreshToken)

        if (!isLogout) {
            throw new UnauthorizedException()
        }
    }

    @Throttle(5, 10)
    @Post('registration')
    @UseGuards(ThrottlerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async registration(@Body() userInput: UserInputModel) {
        const userByLogin = await this.usersQueryRepository.findUserByLogin(userInput.login)
        const userByEmail = await this.usersQueryRepository.findUserByEmail(userInput.email)
        if (userByLogin || userByEmail) {
            const errorsMessages: FieldError[] = []
            if (userByLogin) {
                errorsMessages.push({
                    message: 'Login is already exist',
                    field: 'login'
                })
            }
            if (userByEmail) {
                errorsMessages.push({
                    message: 'Email is already exist',
                    field: 'email'
                })
            }
            throw new BadRequestException(errorsMessages)
        }

        await this.authService.createUser(userInput.login, userInput.password, userInput.email,)
    }

    @Throttle(5, 10)
    @Post('registration-confirmation')
    @UseGuards(ThrottlerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirm(@Body('code') code: string) {
        const isConfirmed = await this.authService.confirmEmail(code)

        if (!isConfirmed) {
            throw new BadRequestException([{
                message: 'The confirmation code is incorrect, expired or already been applied',
                field: 'code',
            }])
        }
    }

    @Throttle(5, 10)
    @Post('registration-email-resending')
    @UseGuards(ThrottlerGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async resendEmail(@Body() { email }: { email: string }): Promise<void | ErrorMessagesOutputModel> {
        const result = await this.authService.resendConfirmationCode(email)

        if (!result) {
            throw new BadRequestException([{
                message: 'Your email is already confirmed or doesn\'t exist',
                field: 'email',
            }])
        }
    }

    @Throttle(5, 10)
    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async recoveryPassword(@Body() { email }: { email: string }): Promise<void> {
        const isRecovering = await this.authService.sendPasswordRecoveryCode(email)
        if (!isRecovering) {
            throw new NotImplementedException()
        }
    }

    @Throttle(5, 10)
    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async generateNewPassword(@Body() newPasswordInputModel: NewPasswordInputModel): Promise<void> {
        const user = await this.usersQueryRepository.findUserByRecoveryPasswordCode(newPasswordInputModel.recoveryCode)

        if (!user || user.passwordRecovery.expirationDate < new Date()) {
            throw new BadRequestException([{
                message: 'recoveryCode is incorrect',
                field: 'recoveryCode',
            }])
        }

        const isConfirmed = await this.authService.confirmRecoveryPassword(user.id, newPasswordInputModel.newPassword)
        if (!isConfirmed) {
            throw new NotImplementedException()
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async sendUserInfo(@CurrentUserId() userId: string): Promise<MeOutputModel> {
        const user = await this.usersQueryRepository.findUserById(userId)

        return {
            email: user.email,
            login: user.login,
            userId: user.id,
        }
    }
}