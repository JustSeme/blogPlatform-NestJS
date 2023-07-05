import { ReadInputQuery } from "../../../general/types/ReadQuery"

export class ReadBannedUsersQueryParams extends ReadInputQuery {
    constructor() {
        super()
    }

    searchLoginTerm: string
}