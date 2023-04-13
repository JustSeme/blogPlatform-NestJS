import { Length } from "class-validator"
import { TrimIfString } from "src/general/decorators/trimIfString.decorator"

export class PostInputModelWithoutBlogId {
    @TrimIfString()
    @Length(3, 30)
    title: string

    @TrimIfString()
    @Length(3, 100)
    shortDescription: string

    @TrimIfString()
    @Length(3, 1000)
    content: string
}