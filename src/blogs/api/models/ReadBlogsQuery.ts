import { ReadInputQuery } from "../../../general/types/ReadQuery"

export class ReadBlogsQueryParams extends ReadInputQuery {
    constructor() {
        super()
    }

    searchNameTerm: string
}