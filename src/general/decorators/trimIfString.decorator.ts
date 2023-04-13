import { Transform } from "class-transformer"

export function TrimIfString() {
    return Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
}