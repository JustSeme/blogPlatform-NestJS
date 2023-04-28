import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../../src/app.module";
import { Test } from "@nestjs/testing";
import { createApp } from "../../src/createApp";
import { UserInputModel } from "../../src/auth/api/models/UserInputModel";
import { HttpStatus } from "@nestjs/common";
import request from 'supertest'
import { BlogInputModel } from "../../src/blogs/api/models/BlogInputModel";
import { PostInputModelWithoutBlogId } from "../../src/blogs/api/models/PostInputModelWithoutBlogId";

describe('blogger-posts', () => {
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

    const incorrectPostInputModel: PostInputModelWithoutBlogId = {
        content: 'this content should be greater then 30 symbols',
        shortDescription: 'sh',
        title: '12'
    }

    it('blogger shouldn\'t create post if postInputModel is incorrect, should display empty posts array', async () => {
        const createdPostData = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(incorrectPostInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(createdPostData.body).toEqual({
            errorsMessages:
                [{
                    field: "title",
                    message: "title must be longer than or equal to 3 characters"
                },
                {
                    field: "shortDescription",
                    message: "shortDescription must be longer than or equal to 3 characters"
                }]
        })

        await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('blogger shouldn\'t create post if blog by blogId doesn\'t exists, should display empty posts array', async () => {
        const createdPostData = await request(httpServer)
            .post(`/blogger/blogs/notABlogId/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.NOT_FOUND)

        expect(createdPostData.body).toEqual({
            errorsMessages: [{
                field: "blogId",
                message: "blog by blogId parameter is not exists"
            }]
        })

        await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.NOT_FOUND)
    })

    const correctPostInputModel: PostInputModelWithoutBlogId = {
        title: 'correct title', // min 3 max 30
        shortDescription: 'short desc', // min 3 max 100
        content: 'this is a content' // min 3 max 1000
    }

    it('blogger shouldn\'t create post if bearer token is incorrect, should display empty posts array', async () => {
        await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer incorrect`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('blogger shouldn\'t create post if that is not him own, should display empty posts array', async () => {
        await request(httpServer)
            .post(`/blogger/blogs/${createdBlogIdByAnotherUser}/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.FORBIDDEN)

        await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('blogger should create post for early created blog and display array with it post', async () => {
        const createdPostData = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdPostData.body.title).toEqual(correctPostInputModel.title)
        expect(createdPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(createdPostData.body.content).toEqual(correctPostInputModel.content)

        const postsViewData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsViewData.body.items[0].title).toEqual(correctPostInputModel.title)
        expect(postsViewData.body.items[0].shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postsViewData.body.items[0].content).toEqual(correctPostInputModel.content)
    })
})