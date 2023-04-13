import { ReadQuery } from "src/general/types/ReadQuery"

export type ReadUsersQuery = ReadQuery & {
    searchLoginTerm: string
    searchEmailTerm: string
}