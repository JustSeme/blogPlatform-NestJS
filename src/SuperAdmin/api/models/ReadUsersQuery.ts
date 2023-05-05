import { ReadQuery } from "../../../general/types/ReadQuery"

export type ReadUsersQuery = ReadQuery & {
    searchLoginTerm: string
    searchEmailTerm: string
    banStatus: string
}