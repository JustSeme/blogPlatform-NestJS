import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { Test } from "@nestjs/testing";
import { createApp } from "../src/createApp";
import { HttpStatus } from "@nestjs/common";
import request from 'supertest'
import { UserInputModel } from "../src/SuperAdmin/api/models/UserInputModel";
import { BlogInputModel } from "../src/Blogger/api/models/BlogInputModel";
import { PostInputModelWithoutBlogId } from "../src/Blogger/api/models/PostInputModelWithoutBlogId";

describe('posts-likes', () => {
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

    const createUserInputData1: UserInputModel = {
        login: 'login',
        password: 'password',
        email: 'email@email.ru'
    }

    const createUserInputData2: UserInputModel = {
        login: 'logi',
        password: 'password',
        email: 'emai@email.ru'
    }

    const createUserInputData3: UserInputModel = {
        login: 'log',
        password: 'password',
        email: 'emaiq@email.ru'
    }

    const createUserInputData4: UserInputModel = {
        login: 'logp',
        password: 'password',
        email: 'ema@email.ru'
    }

    let accessToken1 = ''
    let accessToken2 = ''
    let accessToken3 = ''
    let accessToken4 = ''

    it('should create 4 users and should login, getting accessTokens', async () => {
        await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData1)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData1 = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData1.login,
                password: createUserInputData1.password
            })
            .expect(HttpStatus.OK)
        accessToken1 = accessTokenResponseData1.body.accessToken

        await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData2)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData2 = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData2.login,
                password: createUserInputData2.password
            })
            .expect(HttpStatus.OK)
        accessToken2 = accessTokenResponseData2.body.accessToken

        await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData3)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData3 = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData3.login,
                password: createUserInputData3.password
            })
            .expect(HttpStatus.OK)
        accessToken3 = accessTokenResponseData3.body.accessToken

        await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData4)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData4 = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData4.login,
                password: createUserInputData4.password
            })
            .expect(HttpStatus.OK)
        accessToken4 = accessTokenResponseData4.body.accessToken
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
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdBlogData.body.name).toEqual(correctBlogInputModel.name)
        expect(createdBlogData.body.description).toEqual(correctBlogInputModel.description)
        expect(createdBlogData.body.websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
        expect(createdBlogData.body.creatorId).toBe(undefined)

        createdBlogId = createdBlogData.body.id
    })

    const correctPostInputModel: PostInputModelWithoutBlogId = {
        title: 'correct title', // min 3 max 30
        shortDescription: 'short desc', // min 3 max 100
        content: 'this is a content' // min 3 max 1000
    }

    let createdPostId1
    let createdPostId2
    let createdPostId3
    let createdPostId4
    let createdPostId5
    let createdPostId6
    it('blogger should create 6 posts for early created blog', async () => {
        const createdPostData1 = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId1 = createdPostData1.body.id

        const createdPostData2 = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId2 = createdPostData2.body.id

        const createdPostData3 = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId3 = createdPostData3.body.id

        const createdPostData4 = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId4 = createdPostData4.body.id

        const createdPostData5 = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId5 = createdPostData5.body.id

        const createdPostData6 = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId6 = createdPostData6.body.id
    })

    it('like post 1 by user 1, user 2', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId1}/like-status`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId1}/like-status`)
            .set('Authorization', `Bearer ${accessToken2}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('like post 2 by user 2, user 3', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId2}/like-status`)
            .set('Authorization', `Bearer ${accessToken2}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId2}/like-status`)
            .set('Authorization', `Bearer ${accessToken3}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('dislike post 3 by user 1', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId3}/like-status`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send({
                likeStatus: 'Dislike'
            })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('like post 4 by user 1, user 4, user 2, user 3', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId4}/like-status`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId4}/like-status`)
            .set('Authorization', `Bearer ${accessToken4}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId4}/like-status`)
            .set('Authorization', `Bearer ${accessToken2}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId4}/like-status`)
            .set('Authorization', `Bearer ${accessToken3}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('like post 5 by user 2, dislike by user 3', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId5}/like-status`)
            .set('Authorization', `Bearer ${accessToken2}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId5}/like-status`)
            .set('Authorization', `Bearer ${accessToken3}`)
            .send({
                likeStatus: 'Dislike'
            })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('like post 6 by user 1, dislike by user 2', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId6}/like-status`)
            .set('Authorization', `Bearer ${accessToken1}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${createdPostId6}/like-status`)
            .set('Authorization', `Bearer ${accessToken2}`)
            .send({
                likeStatus: 'Dislike'
            })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('get the posts by user 1 after all likes', async () => {
        const postsData = await request(httpServer)
            .get('/posts')
            .set('Authorization', `Bearer ${accessToken1}`)
        //.expect(HttpStatus.OK)

        console.log(postsData.body);


        expect(postsData.body.items[0].extendedLikesInfo.newestLikes[0].login).toEqual(createUserInputData1.login)
        expect(postsData.body.items[0].extendedLikesInfo.newestLikes[1].login).toEqual(createUserInputData2.login)
    })
})