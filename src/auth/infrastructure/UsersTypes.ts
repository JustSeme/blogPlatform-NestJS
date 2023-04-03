import { HydratedDocument } from "mongoose"
import { User } from "../domain/UsersSchema"

export type HydratedUser = HydratedDocument<User>