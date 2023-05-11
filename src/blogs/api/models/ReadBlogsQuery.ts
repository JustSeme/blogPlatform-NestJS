import { ReadInputQuery } from "../../../general/types/ReadQuery"

export type ReadBlogsQueryParams = ReadInputQuery & {
    searchNameTerm: string
}