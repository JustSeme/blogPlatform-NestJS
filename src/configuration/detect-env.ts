let envFilePath
switch (process.env.NODE_ENV) {
    case ('production'):
        envFilePath = '.env.produtcion'
        break

    case ('development'):
        envFilePath = '.env.development'
        break

    case ('testing'):
        envFilePath = '.env.testing'
        break

    default:
        envFilePath = '.env.development'
        break
}

export { envFilePath }