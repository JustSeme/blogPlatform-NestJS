import { ReadQuery } from "../../../general/types/ReadQuery"

export type ReadBlogsQueryParams = ReadQuery & {
    searchNameTerm: string
}