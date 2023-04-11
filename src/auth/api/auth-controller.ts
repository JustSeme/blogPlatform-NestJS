import {
    BadRequestException,
    Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, Request, Response, UnauthorizedException, UseGuards
} from "@nestjs/common"
import { JwtService } from "src/adapters/jwtService"
import { AuthService } from "../application/auth-service"
import { UserInputModel } from "./models/UserInputModel"
import { ErrorMessagesOutputModel } from "src/types/ErrorMessagesOutputModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import { NewPasswordInputModel } from "./models/NewPasswordInputModel"
import { MeOutputModel } from "../application/dto/MeViewModel"
import { FieldError } from "src/types/ErrorMessagesOutputModel"
import { LocalAuthGuard } from "./guards/local-auth.guard"

@Controller('auth')
export class AuthController {
    constructor(protected authService: AuthService, protected jwtService: JwtService, protected usersQueryRepository: UsersQueryRepository) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Request() req,
        @Response() res,
    ) {
        const deviceName = req.headers["user-agent"]

        const pairOfTokens = await this.authService.login(req.user.id, req.ip, deviceName)

        res.cookie('refreshToken', pairOfTokens.refreshToken, {
            httpOnly: true,
            secure: true,
        })

        res.send({ accessToken: pairOfTokens.accessToken })
    }

    @Post('refresh-tokens')
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

        const isLogout = this.authService.logout(refreshToken)

        if (!isLogout) {
            throw new UnauthorizedException()
        }
    }

    @Post('registration')
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

    @Post('registration-confirmation')
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

    @Post('registration-email-resending')
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

    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async recoveryPassword(@Body() { email }: { email: string }): Promise<void> {
        const isRecovering = await this.authService.sendPasswordRecoveryCode(email)
        if (!isRecovering) {
            throw new NotImplementedException()
        }
    }

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

    @Get('me')
    async sendUserInfo(@Request() req): Promise<MeOutputModel> {
        const accessToken = req.cookies.accessToken
        const userId = await this.jwtService.getUserIdByToken(accessToken)

        if (!userId) {
            throw new UnauthorizedException()
        }

        const user = await this.usersQueryRepository.findUserById(userId)

        return {
            email: user.email,
            login: user.login,
            userId: user.id,
        }
    }
}