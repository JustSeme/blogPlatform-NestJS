import {
    BadRequestException,
    Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, NotImplementedException, Post, Req, Res, UnauthorizedException
} from "@nestjs/common"
import { JwtService } from "src/adapters/jwtService"
import { AuthService } from "../application/auth-service"
import { LoginInputModel } from "./models/LoginInputModel"
import {
    Request, Response
} from "express"
import { UserInputModel } from "./models/UserInputModel"
import { ErrorMessagesOutputModel } from "src/types/ErrorMessagesOutputModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import { NewPasswordInputModel } from "./models/NewPasswordInputModel"
import { MeOutputModel } from "../application/dto/MeViewModel"

@Controller('auth')
export class AuthController {
    constructor(protected authService: AuthService, protected jwtService: JwtService, protected usersQueryRepository: UsersQueryRepository) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginInput: LoginInputModel,
        @Headers('user-agent') userAgent: string,
        @Ip() ip: string,
        @Res() res: Response,
    ) {
        const user = await this.authService.checkCredentials(
            loginInput.loginOrEmail,
            loginInput.password,
        )

        if (!user) {
            throw new UnauthorizedException()
        }

        const pairOfTokens = await this.authService.login(user.id, ip, userAgent,)

        res.cookie('refreshToken', pairOfTokens.refreshToken, {
            httpOnly: true,
            secure: true,
        })

        res.send({ accessToken: pairOfTokens.accessToken })
    }

    @Post('refresh-tokens')
    async refreshTokens(@Req() req: Request, @Res() res: Response) {
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
    async logout(@Req() req: Request) {
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
            const errorsMessages = []
            if (userByLogin) {
                errorsMessages.push({
                    message: 'Login is already exist',
                    field: 'login'
                })
            }
            if (userByEmail) {
                errorsMessages.push({
                    message: 'Email is already exist',
                    feld: 'email'
                })
            }
            throw new BadRequestException(errorsMessages)
        }

        await this.authService.createUser(userInput.login, userInput.password, userInput.email,)
    }

    @Post('registration-confirm')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirm(@Body('code') code: string) {
        const isConfirmed = await this.authService.confirmEmail(code)

        if (!isConfirmed) {
            throw new BadRequestException({
                message: 'The confirmation code is incorrect, expired or already been applied',
                field: 'code',
            })
        }
    }

    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    async resendEmail(@Body() { email }: { email: string }): Promise<void | ErrorMessagesOutputModel> {
        const userByEmail = this.usersQueryRepository.findUserByEmail(email)
        if (!userByEmail) {
            throw new BadRequestException({
                message: 'User by email is doesnt exist',
                field: 'email'
            })
        }

        const result = await this.authService.resendConfirmationCode(email)

        if (!result) {
            throw new BadRequestException({
                message: 'Your email is already confirmed or doesn\'t exist',
                field: 'email',
            })
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
            throw new BadRequestException({
                errorsMessages: [
                    {
                        message: 'recoveryCode is incorrect',
                        field: 'recoveryCode',
                    },
                ],
            })
        }

        const isConfirmed = await this.authService.confirmRecoveryPassword(user.id, newPasswordInputModel.newPassword)
        if (!isConfirmed) {
            throw new NotImplementedException()
        }
    }

    @Get('me')
    async sendUserInfo(@Req() req: Request): Promise<MeOutputModel> {
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