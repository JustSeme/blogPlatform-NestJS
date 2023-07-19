import { GameStatusesEnum } from "../../domain/pair.entity"
import { GamePlayerProgressViewModel } from "./GamePlayerProgressViewModel"
import { QuestionViewModel } from "./QuestionViewModel"

export class GamePairViewModel {
    public id: string
    public firstPlayerProgress: GamePlayerProgressViewModel
    public secondPlayerProgress: GamePlayerProgressViewModel | null
    public questions: Array<QuestionViewModel> | null
    public status: GameStatusesEnum
    public pairCreatedDate: Date
    public startGameDate: Date | null
    public finishGameDate: Date | null
}