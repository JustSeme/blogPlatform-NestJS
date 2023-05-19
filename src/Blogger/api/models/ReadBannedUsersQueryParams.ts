import { ReadInputQuery } from "../../../general/types/ReadQuery"

export type ReadBannedUsersQueryParams = ReadInputQuery & {
    searchLoginTerm: string
}