export class LoginInputDTO {
    constructor(
        public loginOrEmail: string,
        public password: string
    ) { }
}