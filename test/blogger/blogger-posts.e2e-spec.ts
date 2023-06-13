import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../../src/app.module";
import { Test } from "@nestjs/testing";
import { createApp } from "../../src/createApp";
import { HttpStatus } from "@nestjs/common";
import request from 'supertest'
import { UserInputModel } from "../../src/SuperAdmin/api/models/UserInputModel";
import { BlogInputModel } from "../../src/Blogger/api/models/BlogInputModel";
import { PostInputModelWithoutBlogId } from "../../src/Blogger/api/models/PostInputModelWithoutBlogId";

describe('blogger-posts-only', () => {
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

        jest.spyOn(console, 'error')
        // @ts-ignore jest.spyOn adds this functionallity
        console.error.mockImplementation(() => null);

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
            .post(`/sa/users`)
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
            .post(`/sa/users`)
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

        const postsData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsData.body.items.length).toEqual(0);

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

        const postsData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsData.body.items.length).toEqual(0)
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

        const postsData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsData.body.items.length).toEqual(0)
    })

    it('blogger shouldn\'t create post if that is not him own, should display empty posts array', async () => {
        await request(httpServer)
            .post(`/blogger/blogs/${createdBlogIdByAnotherUser}/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.FORBIDDEN)

        const postsData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsData.body.items.length).toEqual(0)

    })

    let createdPostId
    it('blogger should create post for early created blog and display array with it post', async () => {
        const createdPostData = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdPostData.body.title).toEqual(correctPostInputModel.title)
        expect(createdPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(createdPostData.body.content).toEqual(correctPostInputModel.content)

        createdPostId = createdPostData.body.id

        const postsViewData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsViewData.body.items[0].title).toEqual(correctPostInputModel.title)
        expect(postsViewData.body.items[0].shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postsViewData.body.items[0].content).toEqual(correctPostInputModel.content)
    })

    it('shouldn\'t update early created post if inputModel has incorrect values', async () => {
        await request(httpServer)
            .put(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(incorrectPostInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostInputModel.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostInputModel.content)
    })

    it('blogger shouldn\'t update early created post if that is not him own', async () => {
        await request(httpServer)
            .put(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.FORBIDDEN)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostInputModel.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostInputModel.content)
    })

    it('blogger shouldn\'t update early created post if postId is incorrect', async () => {
        await request(httpServer)
            .put(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.FORBIDDEN)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostInputModel.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostInputModel.content)
    })

    it('shouldn\'t update early created post if bearer token is incorrect', async () => {
        await request(httpServer)
            .put(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer incorrect`)
            .send(correctPostInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostInputModel.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostInputModel.content)
    })

    it('shouldn\'t update early created post if post by postId is not found', async () => {
        const errorsData = await request(httpServer)
            .put(`/blogger/blogs/${createdBlogId}/posts/notAPostId`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.NOT_FOUND)

        expect(errorsData.body).toEqual({
            errorsMessages: [{
                field: "postId",
                message: "post by postId parameter is not exists"
            }]
        })

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostInputModel.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostInputModel.content)
    })

    it('shouldn\'t update early created post if blog by blogId is not found', async () => {
        const errorsData = await request(httpServer)
            .put(`/blogger/blogs/notABlogId/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.NOT_FOUND)

        expect(errorsData.body).toEqual({
            errorsMessages: [{
                field: "blogId",
                message: "blog by blogId parameter is not exists"
            }]
        })

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostInputModel.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostInputModel.content)
    })

    const updatePostInputBody = {
        title: 'updated title', // min 3 max 30
        shortDescription: 'updated desc', // min 3 max 100
        content: 'this is a updated content' // min 3 max 1000
    }

    it('should update early created post and display updated info', async () => {
        await request(httpServer)
            .put(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(updatePostInputBody)
            .expect(HttpStatus.NO_CONTENT)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(updatePostInputBody.title)
        expect(updatedPostData.body.shortDescription).toEqual(updatePostInputBody.shortDescription)
        expect(updatedPostData.body.content).toEqual(updatePostInputBody.content)
    })

    it('blogger shouldn\'t delete early created post if blog by blogId is not found, should display not deleted post', async () => {
        await request(httpServer)
            .delete(`/blogger/blogs/notABlogId/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NOT_FOUND)

        const notDeletedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(notDeletedPostData.body.title).toEqual(updatePostInputBody.title)
        expect(notDeletedPostData.body.shortDescription).toEqual(updatePostInputBody.shortDescription)
        expect(notDeletedPostData.body.content).toEqual(updatePostInputBody.content)
    })

    it('blogger shouldn\'t delete early created post if post by postId is not found, should display not deleted post', async () => {
        await request(httpServer)
            .delete(`/blogger/blogs/${createdBlogId}/posts/notAPostId`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NOT_FOUND)

        const notDeletedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(notDeletedPostData.body.title).toEqual(updatePostInputBody.title)
        expect(notDeletedPostData.body.shortDescription).toEqual(updatePostInputBody.shortDescription)
        expect(notDeletedPostData.body.content).toEqual(updatePostInputBody.content)
    })

    it('blogger shouldn\'t delete early created post if bearer token is incorrect, should display not deleted post', async () => {
        await request(httpServer)
            .delete(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)

        const notDeletedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(notDeletedPostData.body.title).toEqual(updatePostInputBody.title)
        expect(notDeletedPostData.body.shortDescription).toEqual(updatePostInputBody.shortDescription)
        expect(notDeletedPostData.body.content).toEqual(updatePostInputBody.content)
    })

    it('blogger shouldn\'t delete early created post if that is not him own, should display not deleted post', async () => {
        await request(httpServer)
            .delete(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .expect(HttpStatus.FORBIDDEN)

        const notDeletedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(notDeletedPostData.body.title).toEqual(updatePostInputBody.title)
        expect(notDeletedPostData.body.shortDescription).toEqual(updatePostInputBody.shortDescription)
        expect(notDeletedPostData.body.content).toEqual(updatePostInputBody.content)
    })

    it('blogger shouldn\'t delete early created post if bearer token is incorrect, should display not deleted post', async () => {
        await request(httpServer)
            .delete(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)

        const notDeletedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(notDeletedPostData.body.title).toEqual(updatePostInputBody.title)
        expect(notDeletedPostData.body.shortDescription).toEqual(updatePostInputBody.shortDescription)
        expect(notDeletedPostData.body.content).toEqual(updatePostInputBody.content)
    })

    it('blogger should delete early created post, then post should be deleted', async () => {
        await request(httpServer)
            .delete(`/blogger/blogs/${createdBlogId}/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.NOT_FOUND)
    })
})