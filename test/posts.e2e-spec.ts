import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from '../src/createApp'

describe('posts', () => {
    let app: NestExpressApplication;
    let httpServer;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication()
        app = createApp(app)
        // app.useGlobalPipes()

        await app.init()

        httpServer = app.getHttpServer()
        await request(httpServer)
            .delete('/testing/all-data')
    });

    afterAll(async () => {
        await app.close();
    });


});
