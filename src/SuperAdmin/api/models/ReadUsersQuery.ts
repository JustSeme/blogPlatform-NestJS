import { ReadInputQuery } from "../../../general/types/ReadQuery"

export type ReadUsersQuery = ReadInputQuery & {
    searchLoginTerm: string
    searchEmailTerm: string
    banStatus: string
}