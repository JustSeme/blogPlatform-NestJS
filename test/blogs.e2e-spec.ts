import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('blogs', () => {
    let app: INestApplication;
    let httpServer;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication()
        // app.useGlobalPipes()

        await app.init()

        httpServer = app.getHttpServer()
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', async () => {
        const res = await request(httpServer).get('/blogs')
        expect(res.body).toBe(null)
    });
});
