import {
    Controller, ForbiddenException, Post, UseGuards
} from "@nestjs/common"
import { JwtAuthGuard } from "../../general/guards/jwt-auth.guard"
import { CurrentUserId } from "../../general/decorators/current-userId.param.decorator"
import { GamePairViewModel } from "../application/dto/GamePairViewModel"
import { CommandBus } from "@nestjs/cqrs"
import { ConnectPlayerCommand } from "../application/use-cases/connect-player-use-case"
import { generateErrorsMessages } from "../../general/helpers/helpers"

@UseGuards(JwtAuthGuard)
@Controller('pair-game-quiz')
export class PairGameQuizController {
    constructor(
        private commandBus: CommandBus
    ) { }


    @Post('pairs/connection')
    async connectPlayerToGame(
        @CurrentUserId() userId: string
    ): Promise<GamePairViewModel> {
        const gamePair = await this.commandBus.execute(
            new ConnectPlayerCommand(userId)
        )

        if (!gamePair) {
            throw new ForbiddenException(generateErrorsMessages('You are already participating in active pair', 'userId'))
        }

        return gamePair
    }
}