import {
    CommandHandler, ICommandHandler
} from "@nestjs/cqrs/dist"
import { GamePairViewModel } from "../dto/GamePairViewModel"

export class ConnectPlayerCommand {
    constructor(
        public playerId: string
    ) { }
}

@CommandHandler(ConnectPlayerCommand)
export class ConnectPlayerUseCase implements ICommandHandler<ConnectPlayerCommand> {

    async execute(command: ConnectPlayerCommand): Promise<GamePairViewModel | null> {
        const playerId = command.playerId

        return null
    }
}