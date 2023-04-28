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

    const createUserInputData: UserInputModel = {
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

    const incorrectBlogInputModel: BlogInputModel = {
        name: 'this name should be a greater then 15 symbols', // min 3 max 15
        description: 'Te', // min 3 max 500
        websiteUrl: 'notAUrl', // min 3 max 100 isUrl
    };

    it('blogger shouldn\'t create blog with incorrect input model', async () => {
        const errorsMessagesData = await request(httpServer)
            .post('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(incorrectBlogInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessagesData.body).toEqual({
            errorsMessages: [
                { field: "name", message: "name must be shorter than or equal to 15 characters" },
                { field: "description", message: "description must be longer than or equal to 3 characters" },
                { field: "websiteUrl", message: "websiteUrl must be a URL address" }
            ]
        })
    })

    it('blogger shouldn\'t create blog without bearer token', async () => {
        await request(httpServer)
            .post('/blogger/blogs')
            .send(incorrectBlogInputModel)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    const correctBlogInputModel: BlogInputModel = {
        name: 'Test Blog name',
        description: 'Test Blog description',
        websiteUrl: 'www.url.com',
    };

    let createdBlogId
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

        createdBlogId = createdBlogData.body.id
    })

    let createdBlogIdByAnotherUser
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

        createdBlogIdByAnotherUser = createdBlogData.body.id
    })

    it('should return 401 error if bearer token is incorrect', async () => {
        await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)
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

    it('blogger shouldn\'t update blog if that is not him own, should display old data', async () => {
        await request(httpServer)
            .put('/blogger/blogs/' + createdBlogIdByAnotherUser)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.FORBIDDEN)

        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].name).toEqual(correctBlogInputModel.name)
        expect(blogsData.body.items[0].description).toEqual(correctBlogInputModel.description)
        expect(blogsData.body.items[0].websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
    })

    it('blogger shouldn\'t update blog without bearer auth token, should display old data', async () => {
        await request(httpServer)
            .put('/blogger/blogs/' + createdBlogId)
            .send(correctBlogInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].name).toEqual(correctBlogInputModel.name)
        expect(blogsData.body.items[0].description).toEqual(correctBlogInputModel.description)
        expect(blogsData.body.items[0].websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
    })

    it('blogger shouldn\'t update blog with incorrect input data, should display old data', async () => {
        await request(httpServer)
            .put('/blogger/blogs/' + createdBlogId)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(incorrectBlogInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].name).toEqual(correctBlogInputModel.name)
        expect(blogsData.body.items[0].description).toEqual(correctBlogInputModel.description)
        expect(blogsData.body.items[0].websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
    })

    const correctBlogUpdateModel: BlogInputModel = {
        name: 'correct name',
        description: 'correct blog description',
        websiteUrl: 'www.websiteUrl.com'
    }

    it('blogger should update blog and display updated data', async () => {
        await request(httpServer)
            .put('/blogger/blogs/' + createdBlogId)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctBlogUpdateModel)
            .expect(HttpStatus.NO_CONTENT)

        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].name).toEqual(correctBlogUpdateModel.name)
        expect(blogsData.body.items[0].description).toEqual(correctBlogUpdateModel.description)
        expect(blogsData.body.items[0].websiteUrl).toEqual(correctBlogUpdateModel.websiteUrl)
    })

    it('blogger shouldn\'t delete blog if that is not him own, should display blogs array with one item', async () => {
        const res = await request(httpServer)
            .delete('/blogger/blogs/' + createdBlogId)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .expect(HttpStatus.FORBIDDEN)


        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items.length).toBe(1)
    })

    it('blogger shouldn\'t delete blog if bearer token is incorrect, should display blogs array with one item', async () => {
        await request(httpServer)
            .delete('/blogger/blogs/' + createdBlogId)
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)

        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items.length).toBe(1)
    })

    it('blogger should delete blog and display blogs array without deleted blog', async () => {
        await request(httpServer)
            .delete('/blogger/blogs/' + createdBlogId)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NO_CONTENT)

        const blogsData = await request(httpServer)
            .get('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(blogsData.body.items.length).toBe(0)
    })

    it('sholdn\'t detele blog if it is already deleted', async () => {
        await request(httpServer)
            .delete('/blogger/blogs/' + createdBlogId)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NOT_FOUND)
    })
});
