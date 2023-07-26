import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { GamePairViewModel } from "../dto/GamePairViewModel"
import { QuizQueryRepository } from "../../../SuperAdmin/infrastructure/typeORM/quiz-typeORM-query-repository"
import { UsersTypeORMQueryRepository } from "../../../SuperAdmin/infrastructure/typeORM/users-typeORM-query-repository"
import { QuizRepository } from "../../../SuperAdmin/infrastructure/typeORM/quiz-typeORM-repository"

export class ConnectPlayerCommand {
    constructor(
        public playerId: string
    ) { }
}

@CommandHandler(ConnectPlayerCommand)
export class ConnectPlayerUseCase implements ICommandHandler<ConnectPlayerCommand> {
    constructor(
        private quizQueryRepository: QuizQueryRepository,
        private usersQueryRepository: UsersTypeORMQueryRepository,
        private quizRepostiory: QuizRepository,
    ) { }


    async execute(command: ConnectPlayerCommand): Promise<GamePairViewModel | null> {
        const playerId = command.playerId

        const player = await this.usersQueryRepository.findUserData(playerId)

        const waitingPair = await this.quizQueryRepository.findWaitingPair()

        if (waitingPair) {
            waitingPair.secondUser = player

            await this.quizRepostiory.dataSourceSave(waitingPair)
        }

        return null
    }
}