import { AuthGuard } from "@nestjs/passport"

export class RefreshJwtAuthGuard extends AuthGuard('refreshJwt') { }