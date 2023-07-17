import { ReadInputQuery } from "../../../../general/types/ReadQuery"

export class ReadUsersQuery extends ReadInputQuery {
    constructor() {
        super()
    }

    searchLoginTerm: string
    searchEmailTerm: string
    banStatus: string
}