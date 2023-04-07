import { ReadQuery } from "src/types/ReadQuery"

export type ReadUsersQuery = ReadQuery & {
    searchLoginTerm: string
    searchEmailTerm: string
}