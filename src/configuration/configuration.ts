export const getConfiguration = () => ({
    ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT, 10) ?? 3000,
    ACCESS_TOKEN_EXPIRE_TIME: process.env.ACCESS_TOKEN_EXPIRE_TIME ?? '10s',
    REFRESH_TOKEN_EXPIRE_TIME: process.env.REFRESH_TOKEN_EXPIRE_TIME ?? '20s',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    GMAIL_LOGIN: process.env.GMAIL_LOGIN,
    JWT_SECRET: process.env.JWT_SECRET,
    SA_LOGIN: process.env.SA_LOGIN,
    SA_PASSWORD: process.env.SA_PASSWORD,
    mongoURI: process.env.mongoURI
})