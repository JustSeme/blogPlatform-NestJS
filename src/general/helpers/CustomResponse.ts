import { CustomResponseHttpEnum } from "./CustomResponse.enum"

export class CustomResponse {
    constructor(
        public readonly statusCode: CustomResponseHttpEnum,
        public readonly message: string,
        public readonly field: string,
    ) { }
}