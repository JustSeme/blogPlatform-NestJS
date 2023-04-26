import {
    BadRequestException,
    Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, Request, Response, UnauthorizedException, UseGuards
} from "@nestjs/common"
import { UserInputModel } from "./models/UserInputModel"
import { UsersQueryRepository } from "../infrastructure/users-query-repository"
import { NewPasswordInputModel } from "./models/NewPasswordInputModel"
import { MeOutputModel } from "../application/dto/MeViewModel"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import {
    ErrorMessagesOutputModel, FieldError
} from "../../general/types/ErrorMessagesOutputModel"
import { JwtAuthGuard } from "../../blogs/api/guards/jwt-auth.guard"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { JwtService } from "../../general/adapters/jwt.adapter"
import { IpRestrictionGuard } from "./guards/ip-restriction.guard"
import { generateErrorsMessages } from "../../general/helpers"
import { EmailInputModel } from "./models/EmailInputModel"
import { LoginCommand } from "../application/use-cases/login.use-case"
import { ConfirmRecoveryPasswordCommand } from "../application/use-cases/confirm-recovery-password.use-case"
import { SendPasswordRecoveryCodeCommand } from "../application/use-cases/send-password-recovery-code.use-case"
import { ResendConfirmationCodeCommand } from "../application/use-cases/resend-confirmation-code.use-case"
import { ConfirmEmailCommand } from "../application/use-cases/confirm-email.use-case"
import { RegistrationUserCommand } from "../application/use-cases/registration-user.use-case"
import { CommandBus } from "@nestjs/cqrs/dist/command-bus"
import { LogoutCommand } from "../application/use-cases/logout.use-case"

@Controller('auth')
export class AuthController {
    constructor(
        protected jwtService: JwtService,
        protected usersQueryRepository: UsersQueryRepository,
        protected commandBus: CommandBus,
    ) { }

    @UseGuards(IpRestrictionGuard, LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Request() req,
        @Response({ passthrough: true }) res,
    ) {
        const deviceName = req.headers["user-agent"] ? req.headers["user-agent"] : 'undefined'

        const pairOfTokens = await this.commandBus.execute(
            new LoginCommand(req.user.id, req.ip, deviceName)
        )

        res.cookie('refreshToken', pairOfTokens.refreshToken, {
            httpOnly: true,
            secure: true,
        })

        return { accessToken: pairOfTokens.accessToken }
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

        const isLogout = await this.commandBus.execute(
            new LogoutCommand(refreshToken)
        )

        if (!isLogout) {
            throw new UnauthorizedException()
        }
    }

    @UseGuards(IpRestrictionGuard)
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

        await this.commandBus.execute(
            new RegistrationUserCommand(userInput.login, userInput.password, userInput.email,)
        )
    }

    @UseGuards(IpRestrictionGuard)
    @Post('registration-confirmation')
    @HttpCode(HttpStatus.NO_CONTENT)
    async registrationConfirm(@Body('code') code: string) {
        const isConfirmed = await this.commandBus.execute(
            new ConfirmEmailCommand(code)
        )

        if (!isConfirmed) {
            throw new BadRequestException(generateErrorsMessages('The confirmation code is incorrect, expired or already been applied', 'code'))
        }
    }

    @UseGuards(IpRestrictionGuard)
    @Post('registration-email-resending')
    @HttpCode(HttpStatus.NO_CONTENT)
    async resendEmail(@Body() { email }: EmailInputModel): Promise<void | ErrorMessagesOutputModel> {
        const result = await this.commandBus.execute(
            new ResendConfirmationCodeCommand(email)
        )

        if (!result) {
            throw new BadRequestException(generateErrorsMessages('Your email is already confirmed or doesn\'t exist', 'email'))
        }
    }

    @UseGuards(IpRestrictionGuard)
    @Post('password-recovery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async recoveryPassword(@Body() { email }: EmailInputModel): Promise<void> {
        const isRecovering = await this.commandBus.execute(
            new SendPasswordRecoveryCodeCommand(email)
        )
        if (!isRecovering) {
            throw new NotImplementedException()
        }
    }

    @UseGuards(IpRestrictionGuard)
    @Post('new-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async generateNewPassword(@Body() newPasswordInputModel: NewPasswordInputModel): Promise<void> {
        const user = await this.usersQueryRepository.findUserByRecoveryPasswordCode(newPasswordInputModel.recoveryCode)

        if (!user || user.passwordRecovery.expirationDate < new Date()) {
            throw new BadRequestException(generateErrorsMessages('recoveryCode is incorrect', 'recoveryCode'))
        }

        const isConfirmed = await this.commandBus.execute(
            new ConfirmRecoveryPasswordCommand(user.id, newPasswordInputModel.newPassword)
        )
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