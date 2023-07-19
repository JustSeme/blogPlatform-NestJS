import { AnswersViewModel } from "./AnswersViewModel"
import { PlayerViewModel } from "./PlayerViewModel"

export class GamePlayerProgressViewModel {
    answers: Array<AnswersViewModel>
    player: PlayerViewModel
    score: number
}

