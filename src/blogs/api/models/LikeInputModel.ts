import { IsEnum } from "class-validator"

enum LikeTypeEnum {
    'None',
    'Like',
    'Dislike'
}

export class LikeInputModel {
    @IsEnum(LikeTypeEnum, { message: 'likeStatus is incorrect' })
    likeStatus: LikeType
}

export type LikeType = 'None' | 'Like' | 'Dislike'