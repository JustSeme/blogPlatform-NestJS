export class AnswersViewModel {
    public questionId: string
    public answerStatus: AnswerStatuses
    public addedAt: Date
}

export enum AnswerStatuses {
    'Correct' = 'Correct',
    'Incorrect' = 'Incorrect'
}