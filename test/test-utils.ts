import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { createApp } from "../src/createApp";

export const initAppAndGetHttpServer = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();
    let app: NestExpressApplication;
    app = moduleFixture.createNestApplication()
    app = createApp(app)

    await app.init()

    jest.spyOn(console, 'error')
    // @ts-ignore jest.spyOn adds this functionallity
    console.error.mockImplementation(() => null);

    return app.getHttpServer()
}