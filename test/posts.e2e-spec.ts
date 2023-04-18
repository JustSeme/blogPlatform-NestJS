import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from '../src/createApp'
import { BlogInputModel } from '../src/blogs/api/models/BlogInputModel';
import { PostInputModel } from '../src/blogs/api/models/PostInputModel';
import { CommentInputModel } from '../src/blogs/api/models/CommentInputModel';
import { LikeInputModel } from '../src/blogs/api/models/LikeInputModel';
import { funcSleep } from '../src/general/helpers';

describe('posts', () => {
    let app: NestExpressApplication;
    let httpServer;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication()
        app = createApp(app)

        await app.init()

        httpServer = app.getHttpServer()
        await request(httpServer)
            .delete('/testing/all-data')
    });

    afterAll(async () => {
        await app.close();
    });

    const correctBlogBody: BlogInputModel = {
        name: 'name',
        description: 'desc',
        websiteUrl: 'www.website.com'
    }

    let recievedAccessToken = ''
    let secondAccessToken = ''
    let thirdAccessToken = ''

    const createUserInputData = {
        login: 'firstLogin',
        password: 'password',
        email: 'email@email.ru'
    }
    const secondUserInputData = {
        login: 'secondLogi',
        password: 'password',
        email: 'email2@email.ru'
    }
    const thirdUserInputData = {
        login: 'thirdLogin',
        password: 'password',
        email: 'email3@email.ru'
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

    it('should create user and should login, getting second accessToken', async () => {
        await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(secondUserInputData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: secondUserInputData.login,
                password: secondUserInputData.password
            })
            .expect(HttpStatus.OK)
        secondAccessToken = accessTokenResponseData.body.accessToken
    })

    it('should create user and should login, getting the thirdd accessToken', async () => {
        await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(thirdUserInputData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: thirdUserInputData.login,
                password: thirdUserInputData.password
            })
            .expect(HttpStatus.OK)
        thirdAccessToken = accessTokenResponseData.body.accessToken
    })

    let blogId = ''
    it('should create blog for get blogId ', async () => {
        const createdBlogData = await request(httpServer)
            .post(`/blogs`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(correctBlogBody)
            .expect(HttpStatus.CREATED)

        blogId = createdBlogData.body.id
    })

    it('shouldn\'t create post without basic auth', async () => {
        await request(httpServer)
            .post(`/posts`)
            .send(incorrectPostBody)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    const incorrectPostBody: PostInputModel = {
        title: 'this title will be a over 30 symbols', // min 3 max 30
        shortDescription: 'in', // min: 3, max: 100 
        content: 'co', // min: 3, max: 1000 
        blogId: 'notABlogId'
    }

    it('shouldn\'t create post with incorrect input data', async () => {
        const errorsMessagesData = await request(httpServer)
            .post(`/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(incorrectPostBody)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessagesData.body.errorsMessages[0].field).toEqual('title')
        expect(errorsMessagesData.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(errorsMessagesData.body.errorsMessages[2].field).toEqual('content')
        expect(errorsMessagesData.body.errorsMessages[3].field).toEqual('blogId')
        expect(errorsMessagesData.body.errorsMessages[3].message).toEqual('Blog by blogId is not exists')
    })

    const correctPostBody: PostInputModel = {
        title: 'correctTitle', // min 3 max 30
        shortDescription: 'correct description', // min: 3, max: 100 
        content: 'correct content', // min: 3, max: 1000 
        blogId: blogId
    }

    let createdPostId = ''

    it('should create post with correct input data and display correct info', async () => {
        correctPostBody.blogId = blogId

        const createdPostData = await request(httpServer)
            .post(`/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(correctPostBody)
            .expect(HttpStatus.CREATED)

        createdPostId = createdPostData.body.id

        const gettedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(gettedPostData.body.title).toEqual(correctPostBody.title)
        expect(gettedPostData.body.shortDescription).toEqual(correctPostBody.shortDescription)
        expect(gettedPostData.body.content).toEqual(correctPostBody.content)
        expect(gettedPostData.body.blogId).toEqual(correctPostBody.blogId)
    })

    it('shouldn\'t update created post with incorrect input data', async () => {
        const errorsMessagesData = await request(httpServer)
            .put(`/posts/${createdPostId}`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(incorrectPostBody)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessagesData.body.errorsMessages[0].field).toEqual('title')
        expect(errorsMessagesData.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(errorsMessagesData.body.errorsMessages[2].field).toEqual('content')
        expect(errorsMessagesData.body.errorsMessages[3].field).toEqual('blogId')
        expect(errorsMessagesData.body.errorsMessages[3].message).toEqual('Blog by blogId is not exists')

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostBody.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostBody.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostBody.content)
    })

    it('shouldn\'t update created post without basic auth', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId}`)
            .send(correctUpdatePostBody)
            .expect(HttpStatus.UNAUTHORIZED)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctPostBody.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctPostBody.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctPostBody.content)
    })

    const correctUpdatePostBody: PostInputModel = {
        title: 'updated',
        shortDescription: 'updated description',
        content: 'updated content',
        blogId: correctPostBody.blogId
    }

    it('should update created post and display correct info', async () => {
        correctUpdatePostBody.blogId = correctPostBody.blogId
        await request(httpServer)
            .put(`/posts/${createdPostId}`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(correctUpdatePostBody)
            .expect(HttpStatus.NO_CONTENT)

        const updatedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(updatedPostData.body.title).toEqual(correctUpdatePostBody.title)
        expect(updatedPostData.body.shortDescription).toEqual(correctUpdatePostBody.shortDescription)
        expect(updatedPostData.body.content).toEqual(correctUpdatePostBody.content)
    })

    const correctCommentBody: CommentInputModel = {
        content: 'this content will over 20 symbols' // min 20 max 300
    }
    it('should create comment for current post and display correct info', async () => {
        await request(httpServer)
            .post(`/posts/${createdPostId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctCommentBody)
            .expect(HttpStatus.CREATED)

        const recievedCreatedCommentsData = await request(httpServer)
            .get(`/posts/${createdPostId}/comments`)
            .expect(HttpStatus.OK)

        expect(recievedCreatedCommentsData.body.items.length).toEqual(1)
        expect(recievedCreatedCommentsData.body.items[0].content).toEqual(correctCommentBody.content)
    })

    it('should dislike current post and display correct info', async () => {
        const dislikeBody: LikeInputModel = {
            likeStatus: 'Dislike'
        }

        await request(httpServer)
            .put(`/posts/${createdPostId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(dislikeBody)
            .expect(HttpStatus.NO_CONTENT)

        const likedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedPostData.body.extendedLikesInfo.likesCount).toEqual(0)
        expect(likedPostData.body.extendedLikesInfo.dislikesCount).toEqual(1)
        expect(likedPostData.body.extendedLikesInfo.myStatus).toEqual('Dislike')

        expect(likedPostData.body.extendedLikesInfo.newestLikes.length).toEqual(0)
    })

    it('should set None for current post and display correct info', async () => {
        const noneBody: LikeInputModel = {
            likeStatus: 'None'
        }

        await request(httpServer)
            .put(`/posts/${createdPostId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(noneBody)
            .expect(HttpStatus.NO_CONTENT)

        const likedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedPostData.body.extendedLikesInfo.likesCount).toEqual(0)
        expect(likedPostData.body.extendedLikesInfo.dislikesCount).toEqual(0)
        expect(likedPostData.body.extendedLikesInfo.myStatus).toEqual('None')

        expect(likedPostData.body.extendedLikesInfo.newestLikes.length).toEqual(0)
    })
    const likeBody: LikeInputModel = {
        likeStatus: 'Like'
    }

    it('should like current post and display correct info', async () => {
        // got unauthorized becouse access token expire time is 10s
        await request(httpServer)
            .put(`/posts/${createdPostId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(likeBody)
            .expect(HttpStatus.NO_CONTENT)

        const likedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedPostData.body.extendedLikesInfo.likesCount).toEqual(1)
        expect(likedPostData.body.extendedLikesInfo.dislikesCount).toEqual(0)
        expect(likedPostData.body.extendedLikesInfo.myStatus).toEqual('Like')

        expect(likedPostData.body.extendedLikesInfo.newestLikes[0].login).toEqual(createUserInputData.login)
    })

    it('should like current post and add second like in newestLikes', async () => {
        await funcSleep(11000)

        await request(httpServer)
            .put(`/posts/${createdPostId}/like-status`)
            .set('Authorization', `Bearer ${secondAccessToken}`)
            .send(likeBody)
            .expect(HttpStatus.NO_CONTENT)

        const likedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${secondAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedPostData.body.extendedLikesInfo.likesCount).toEqual(2)
        expect(likedPostData.body.extendedLikesInfo.dislikesCount).toEqual(0)
        expect(likedPostData.body.extendedLikesInfo.myStatus).toEqual('Like')

        expect(likedPostData.body.extendedLikesInfo.newestLikes[0].login).toEqual(secondUserInputData.login)
        expect(likedPostData.body.extendedLikesInfo.newestLikes[1].login).toEqual(createUserInputData.login)
    })

    it('should like current post and add the third like in newestLikes', async () => {
        await request(httpServer)
            .put(`/posts/${createdPostId}/like-status`)
            .set('Authorization', `Bearer ${thirdAccessToken}`)
            .send(likeBody)
            .expect(HttpStatus.NO_CONTENT)

        const likedPostData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .set('Authorization', `Bearer ${thirdAccessToken}`)
            .expect(HttpStatus.OK)

        expect(likedPostData.body.extendedLikesInfo.likesCount).toEqual(3)
        expect(likedPostData.body.extendedLikesInfo.dislikesCount).toEqual(0)
        expect(likedPostData.body.extendedLikesInfo.myStatus).toEqual('Like')

        expect(likedPostData.body.extendedLikesInfo.newestLikes[0].login).toEqual(thirdUserInputData.login)
        expect(likedPostData.body.extendedLikesInfo.newestLikes[1].login).toEqual(secondUserInputData.login)
        expect(likedPostData.body.extendedLikesInfo.newestLikes[2].login).toEqual(createUserInputData.login)
    })

    it('create new post, like this post, dislike this post, set none for this post, should display correct info', async () => {
        const myData = {
            login: 'justLogin',
            password: 'password',
            email: 'justEmail@email.ru'
        }
        await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(myData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: myData.login,
                password: myData.password
            })
            .expect(HttpStatus.OK)

        const accessTokenForThisTest = accessTokenResponseData.body.accessToken

        const postInputBody = {
            title: 'anyTitle1',
            shortDescription: 'description',
            content: 'contentfdsfdsfdsfdsfdsfdsfdsfdsfdsf',
            blogId: blogId
        }

        const createdPostData = await request(httpServer)
            .post(`/posts`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(postInputBody)
            .expect(HttpStatus.CREATED)

        const postIdForThisTest = createdPostData.body.id

        await request(httpServer)
            .put(`/posts/${postIdForThisTest}/like-status`)
            .set('Authorization', `Bearer ${accessTokenForThisTest}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        const likedPostData = await request(httpServer)
            .get(`/posts/${postIdForThisTest}`)
            .set('Authorization', `Bearer ${accessTokenForThisTest}`)
            .expect(HttpStatus.OK)

        expect(likedPostData.body.extendedLikesInfo.likesCount).toEqual(1)
        expect(likedPostData.body.extendedLikesInfo.myStatus).toEqual('Like')

        await request(httpServer)
            .put(`/posts/${postIdForThisTest}/like-status`)
            .set('Authorization', `Bearer ${accessTokenForThisTest}`)
            .send({
                likeStatus: 'Dislike'
            })
            .expect(HttpStatus.NO_CONTENT)

        const dislikedPostData = await request(httpServer)
            .get(`/posts/${postIdForThisTest}`)
            .set('Authorization', `Bearer ${accessTokenForThisTest}`)
            .expect(HttpStatus.OK)

        expect(dislikedPostData.body.extendedLikesInfo.likesCount).toEqual(0)
        expect(dislikedPostData.body.extendedLikesInfo.dislikesCount).toEqual(1)
        expect(dislikedPostData.body.extendedLikesInfo.myStatus).toEqual('Dislike')

        await request(httpServer)
            .put(`/posts/${postIdForThisTest}/like-status`)
            .set('Authorization', `Bearer ${accessTokenForThisTest}`)
            .send({
                likeStatus: 'None'
            })
            .expect(HttpStatus.NO_CONTENT)

        const nonePostData = await request(httpServer)
            .get(`/posts/${postIdForThisTest}`)
            .set('Authorization', `Bearer ${accessTokenForThisTest}`)
            .expect(HttpStatus.OK)

        expect(nonePostData.body.extendedLikesInfo.likesCount).toEqual(0)
        expect(nonePostData.body.extendedLikesInfo.dislikesCount).toEqual(0)
        expect(nonePostData.body.extendedLikesInfo.myStatus).toEqual('None')
    })

    it('shouldn\'t delete post without basic auth', async () => {
        await request(httpServer)
            .delete(`/posts/${createdPostId}`)
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)
    })

    it('shouldn\'t delete post with incorrect postId', async () => {
        await request(httpServer)
            .delete(`/posts/12345`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .expect(HttpStatus.NOT_FOUND)

        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)
    })

    it('should delete post', async () => {
        await funcSleep(11000)

        await request(httpServer)
            .delete(`/posts/${createdPostId}`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.NOT_FOUND)
    })
});
