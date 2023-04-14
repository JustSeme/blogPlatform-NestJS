import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { BlogsService } from '../src/blogs/application/blogs-service';
/* const request = require('supertest') */

describe('blogs', () => {
    let app: INestApplication;
    let connection;
    let httpServer;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        connection = moduleFixture.get<BlogsService>(BlogsService).getMongoConnection()
        app = moduleFixture.createNestApplication()
        // app.useGlobalPipes()

        await app.init()

        httpServer = app.getHttpServer()
    });

    afterAll(async () => {
        await app.close();
    });

    it('/ (GET)', async () => {
        const res = (await request(httpServer).get('/blogs'))
        expect(res.body.data).toBe(null)
    });
});
