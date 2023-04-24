import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { BlogInputModel } from '../src/blogs/api/models/BlogInputModel';
import { createApp } from '../src/createApp'
import { PostInputModel } from '../src/blogs/api/models/PostInputModel';
import { CommentInputModel } from '../src/blogs/api/models/CommentInputModel';

describe('comments', () => {
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
    let recievedRefreshToken = ''

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
        recievedRefreshToken = accessTokenResponseData.headers['set-cookie']
    })

    let postId = ''

    it('should create blog and post for it ', async () => {
        const correctBlogBody: BlogInputModel = {
            name: 'name', //min 3 max 15
            description: 'description', // min 3 max 500
            websiteUrl: 'http://anyurl.com' // min 3 max 100, pattern ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
        }

        const createdBlogResponse = await request(httpServer)
            .post(`/blogs`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(correctBlogBody)
            .expect(HttpStatus.CREATED)

        const correctPostBody: PostInputModel = {
            title: 'postTitle', // min 3 max 30
            shortDescription: 'shortDescription', // min 3 max 100
            content: 'anyContent', // min 3 max 1000
            blogId: ''
        }
        correctPostBody.blogId = createdBlogResponse.body.id

        const createdPostResponseData = await request(httpServer)
            .post(`/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(correctPostBody)
            .expect(HttpStatus.CREATED)

        expect(createdPostResponseData.body)

        postId = createdPostResponseData.body.id
    })

    const correctCommentBody: CommentInputModel = {
        content: 'this content should be a correct' // min 20 max 300
    }

    const incorrectCommentBody: CommentInputModel = {
        content: '<20 chars' // min 20 max 300
    }

    let createdCommentId = ''

    it('should create comment for created post', async () => {
        const createdCommentResponseData = await request(httpServer)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctCommentBody)
            .expect(HttpStatus.CREATED)

        createdCommentId = createdCommentResponseData.body.id
    })

    it('shouldn\'t create comment for created post', async () => {
        await request(httpServer)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(incorrectCommentBody)
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('should get created comment by id', async () => {
        const recievedCommentData = await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .expect(HttpStatus.OK)

        expect(recievedCommentData.body.content).toEqual(correctCommentBody.content)
        expect(recievedCommentData.body.commentatorInfo.userLogin).toEqual(createUserInputData.login)
    })

    it('shouldn\'t get comment by id if it doesn\'t exist', async () => {
        await request(httpServer)
            .get(`/comments/12345`)
            .expect(HttpStatus.NOT_FOUND)
    })


    it('shouldn\'t update comment by id if access token is incorrect', async () => {
        const responseData = await request(httpServer)
            .put(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer incorrect`)
            .send({
                content: 'this comment wasn\'t be updated'
            })
            .expect(HttpStatus.UNAUTHORIZED)

        expect(responseData.body)

        const updatedCommentData = await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .expect(HttpStatus.OK)

        expect(updatedCommentData.body.content).toEqual(correctCommentBody.content)
    })

    it('should update comment by id', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                content: 'this comment was be updated'
            })
            .expect(HttpStatus.NO_CONTENT)

        const updatedCommentData = await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .expect(HttpStatus.OK)

        expect(updatedCommentData.body.content).toEqual('this comment was be updated')
    })

    it('should return 400 code, trying like comment with incorrect value', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'incorrect' // correct: Like, Dislike, None
            })
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 401 code, tring like comment without bearer auth', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .set('Authorization', `Bearer token`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return 404 code, trying like non-exist comment', async () => {
        await request(httpServer)
            .put(`/comments/12345/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NOT_FOUND)
    })

    it('shouldn\'t like created comment without authorization', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('shouldn\'t like created comment with incorrect input data', async () => {
        const response = await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'incorrect'
            })
            .expect(HttpStatus.BAD_REQUEST)

        expect(response.body).toEqual({
            errorsMessages: [{
                message: 'likeStatus is incorrect',
                field: 'likeStatus'
            }]
        })
    })

    it('should like created comment and display correct like info', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)


        const likedCommentData = await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedCommentData.body.likesInfo.likesCount).toEqual(1)
        expect(likedCommentData.body.likesInfo.dislikesCount).toEqual(0)
        expect(likedCommentData.body.likesInfo.myStatus).toEqual('Like')
    })

    it('should switch Like to Dislike and display correct like info', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'Dislike'
            })
            .expect(HttpStatus.NO_CONTENT)


        const likedCommentData = await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedCommentData.body.likesInfo.likesCount).toEqual(0)
        expect(likedCommentData.body.likesInfo.dislikesCount).toEqual(1)
        expect(likedCommentData.body.likesInfo.myStatus).toEqual('Dislike')
    })

    it('should set None instead of Like/Dislike and display correct like info', async () => {
        await request(httpServer)
            .put(`/comments/${createdCommentId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'None'
            })
            .expect(HttpStatus.NO_CONTENT)


        const likedCommentData = await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedCommentData.body.likesInfo.likesCount).toEqual(0)
        expect(likedCommentData.body.likesInfo.dislikesCount).toEqual(0)
        expect(likedCommentData.body.likesInfo.myStatus).toEqual('None')
    })

    it('should refresh tokens, using refreshToken', async () => {
        const response = await request(httpServer)
            .post('/auth/refresh-token')
            .set('Cookie', recievedRefreshToken)
            .expect(HttpStatus.OK)

        recievedAccessToken = response.body.accessToken
        recievedRefreshToken = response.header['set-cookie']
    })

    it('should delete comment by id', async () => {
        //test fail if accessToken expire time is 10s
        await request(httpServer)
            .delete(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('shouldn\'t delete comment by id if it is already deleted', async () => {
        //test fail if accessToken expire time is 10s
        await request(httpServer)
            .delete(`/comments/${createdCommentId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.NOT_FOUND)
    })
});
