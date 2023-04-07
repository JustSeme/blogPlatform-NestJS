import { ReadQuery } from "src/types/ReadQuery"

export type ReadBlogsQueryParams = ReadQuery & {
    searchNameTerm: string
}