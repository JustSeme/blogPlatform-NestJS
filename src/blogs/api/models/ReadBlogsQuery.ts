import { ReadQuery } from "src/general/types/ReadQuery"

export type ReadBlogsQueryParams = ReadQuery & {
    searchNameTerm: string
}