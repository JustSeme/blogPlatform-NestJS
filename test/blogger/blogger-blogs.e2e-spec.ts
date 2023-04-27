import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/createApp';
import { UserInputModel } from '../../src/auth/api/models/UserInputModel';
import { BlogInputModel } from '../../src/blogs/api/models/BlogInputModel';

describe('blogger-blogs', () => {
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
        //await app.close();
    });

    let recievedAccessToken = ''

    const createUserInputData = {
        login: 'login',
        password: 'password',
        email: 'email@email.ru'
    }

    it('should create user and should login, getting accessToken', async () => {
        await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData.login,
                password: createUserInputData.password
            })
            .expect(HttpStatus.OK)
        recievedAccessToken = accessTokenResponseData.body.accessToken
    })

    const secondCreateUserInputData = {
        login: 'log',
        password: 'password',
        email: 'emal@email.ru'
    }

    let secondRecievedAccessToken = ''

    it('should create another user and should login, getting accessToken', async () => {
        await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(secondCreateUserInputData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: secondCreateUserInputData.login,
                password: secondCreateUserInputData.password
            })
            .expect(HttpStatus.OK)
        secondRecievedAccessToken = accessTokenResponseData.body.accessToken
    })

    const correctBlogInputModel: BlogInputModel = {
        name: 'Test Blog name',
        description: 'Test Blog description',
        websiteUrl: 'www.url.com',
    };

    it('blogger should create blog and display blogViewModel', async () => {
        const createdBlogData = await request(httpServer)
            .post('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdBlogData.body.name).toEqual(correctBlogInputModel.name)
        expect(createdBlogData.body.description).toEqual(correctBlogInputModel.description)
        expect(createdBlogData.body.websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
        expect(createdBlogData.body.creatorId).toBe(undefined)
    })

    it('another blogger should create blog and display blogViewModel', async () => {
        const createdBlogData = await request(httpServer)
            .post('/blogger/blogs')
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdBlogData.body.name).toEqual(correctBlogInputModel.name)
        expect(createdBlogData.body.description).toEqual(correctBlogInputModel.description)
        expect(createdBlogData.body.websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
        expect(createdBlogData.body.creatorId).toBe(undefined)
    })

    it('should return one blog for it owner', async () => {
        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items.length).toBe(1)
        expect(blogsData.body.items[0].name).toEqual(correctBlogInputModel.name)
        expect(blogsData.body.items[0].description).toEqual(correctBlogInputModel.description)
        expect(blogsData.body.items[0].websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
    })
});
