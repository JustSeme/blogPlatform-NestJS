import dotenv from 'dotenv'

dotenv.config()

export const settings = {
    mongoURI: process.env.mongoURI,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 3000,
    GMAIL_LOGIN: process.env.GMAIL_LOGIN,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    SA_LOGIN: process.env.SA_LOGIN,
    SA_PASSWORD: process.env.SA_PASSWORD,
    ACCESS_TOKEN_EXPIRE_TIME: '10s',
    REFRESH_TOKEN_EXPIRE_TIME: '20s',
}

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    NOT_FOUND_404: 404,
    BAD_REQUEST_400: 400,
    UNAUTHORIZED_401: 401,
    FORBIDDEN_403: 403,
    TOO_MANY_REQUESTS_429: 429,

    NOT_IMPLEMENTED_501: 501
}