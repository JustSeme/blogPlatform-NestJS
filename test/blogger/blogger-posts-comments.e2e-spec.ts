import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UserInputModel } from '../../src/SuperAdmin/api/models/UserInputModel';
import { BlogInputModel } from '../../src/Blogger/api/models/BlogInputModel';
import { PostInputModelWithoutBlogId } from '../../src/Blogger/api/models/PostInputModelWithoutBlogId';
import { CommentInputModel } from '../../src/blogs/api/models/CommentInputModel';
import { BanUserForBlogInputModel } from '../../src/Blogger/api/models/BanUserForBlogInputModel'
import { initAppAndGetHttpServer } from '../test-utils';

describe('blogger-posts-comments', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    let recievedAccessToken = ''

    const createUserInputData: UserInputModel = {
        login: 'login',
        password: 'password',
        email: 'email@email.ru'
    }

    let blogOwnerUserId
    it('should create user and should login, getting accessToken', async () => {
        const createdUserData = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData)
            .expect(HttpStatus.CREATED)

        blogOwnerUserId = createdUserData.body.id

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

    let anotherUserId
    it('should create another user and should login, getting accessToken', async () => {
        const createdUserData = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(secondCreateUserInputData)
            .expect(HttpStatus.CREATED)

        anotherUserId = createdUserData.body.id

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
        expect(createdBlogData.body.blogOwnerInfo).toBe(undefined)

        createdBlogId = createdBlogData.body.id
    })

    const correctPostInputModel: PostInputModelWithoutBlogId = {
        title: 'correct title', // min 3 max 30
        shortDescription: 'short desc', // min 3 max 100
        content: 'this is a content' // min 3 max 1000
    }

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

    let secondCreatedPostId
    it('blogger should create another post for early created blog and display array with it post', async () => {
        const createdPostData = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdPostData.body.title).toEqual(correctPostInputModel.title)
        expect(createdPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(createdPostData.body.content).toEqual(correctPostInputModel.content)

        secondCreatedPostId = createdPostData.body.id

        const postsViewData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsViewData.body.items[1].title).toEqual(correctPostInputModel.title)
        expect(postsViewData.body.items[1].shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postsViewData.body.items[1].content).toEqual(correctPostInputModel.content)
    })

    const commentInputModel: CommentInputModel = {
        content: 'this is a correct comment content'
    }

    it('blogger and another user should create comment for post', async () => {
        await request(httpServer)
            .post(`/posts/${createdPostId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.CREATED)

        await request(httpServer)
            .post(`/posts/${createdPostId}/comments`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.CREATED)

        const commentsData = await request(httpServer)
            .get(`/posts/${createdPostId}/comments`)
            .expect(HttpStatus.OK)

        expect(commentsData.body.items[0].content).toEqual(commentInputModel.content)
        expect(commentsData.body.items[1].content).toEqual(commentInputModel.content)
    })

    it('blogger and another user should create comment for another post', async () => {
        await request(httpServer)
            .post(`/posts/${secondCreatedPostId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.CREATED)

        await request(httpServer)
            .post(`/posts/${secondCreatedPostId}/comments`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.CREATED)

        const commentsData = await request(httpServer)
            .get(`/posts/${secondCreatedPostId}/comments`)
            .expect(HttpStatus.OK)


        expect(commentsData.body.items[0].content).toEqual(commentInputModel.content)
        expect(commentsData.body.items[1].content).toEqual(commentInputModel.content)
    })

    it('shouldn\' return all comments for all blogger posts if bearer token is incorrect', async () => {
        await request(httpServer)
            .get('/blogger/blogs/comments')
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return all comments for all blogger posts', async () => {
        const allCommentsData = await request(httpServer)
            .get('/blogger/blogs/comments?sortDirection=asc')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(allCommentsData.body.items.length).toEqual(4)
        expect(allCommentsData.body.items[0].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[1].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[2].postInfo.id).toEqual(secondCreatedPostId)
        expect(allCommentsData.body.items[3].postInfo.id).toEqual(secondCreatedPostId)
    })

    const incorrectBanUserForBlogInputModel = {
        isBanned: 'true',
        banReason: 'you', // min 10 max 1000
        blogId: 'incorrect'
    }

    it('shouldn\'t ban another user if input model is incorrect', async () => {
        const errorsMessagesData = await request(httpServer)
            .put(`/blogger/users/${anotherUserId}/ban`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(incorrectBanUserForBlogInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessagesData.body.errorsMessages.length).toEqual(3)
        expect(errorsMessagesData.body.errorsMessages[0].message).toEqual("isBanned must be a boolean value")
        expect(errorsMessagesData.body.errorsMessages[1].message).toEqual('banReason must be longer than or equal to 20 characters')
        expect(errorsMessagesData.body.errorsMessages[2].message).toEqual('Blog by blogId is not exists')
    })

    const banUserForBlogInputModel: BanUserForBlogInputModel = {
        isBanned: true,
        banReason: 'you are banned for this test', // min 10 max 1000
        blogId: ''
    }

    it('shouldn\' ban another user if accessToken is incorrect', async () => {
        banUserForBlogInputModel.blogId = createdBlogId

        await request(httpServer)
            .put(`/blogger/users/${anotherUserId}/ban`)
            .set('Authorization', `Bearer incorrecct`)
            .send(banUserForBlogInputModel)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('shouldn\'t ban another user if userId is incorrect', async () => {
        await request(httpServer)
            .put(`/blogger/users/incorrectUserId/ban`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(banUserForBlogInputModel)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('should ban another user', async () => {
        await request(httpServer)
            .put(`/blogger/users/${anotherUserId}/ban`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(banUserForBlogInputModel)
            .expect(HttpStatus.NO_CONTENT)
    })

    it('should return all banned users for blog', async () => {
        const allBannedUsersData = await request(httpServer)
            .get(`/blogger/users/blog/${createdBlogId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(allBannedUsersData.body.items[0].id).toEqual(anotherUserId)
        expect(allBannedUsersData.body.items[0].login).toEqual(secondCreateUserInputData.login)
        expect(allBannedUsersData.body.items[0].banInfo.isBanned).toEqual(true)
        expect(allBannedUsersData.body.items[0].banInfo.banReason).toEqual(banUserForBlogInputModel.banReason)
    })

    it('shouldn\'t return all banned users for blog if access token is incorrect', async () => {
        await request(httpServer)
            .get(`/blogger/users/blog/${createdBlogId}`)
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it(`shouldn't create comments for posts, if this user is banned for blog`, async () => {
        await request(httpServer)
            .post(`/posts/${createdPostId}/comments`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.FORBIDDEN)

        await request(httpServer)
            .post(`/posts/${secondCreatedPostId}/comments`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.FORBIDDEN)

        const allCommentsData = await request(httpServer)
            .get('/blogger/blogs/comments?sortDirection=asc')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(allCommentsData.body.items.length).toEqual(4)
        expect(allCommentsData.body.items[0].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[1].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[2].postInfo.id).toEqual(secondCreatedPostId)
        expect(allCommentsData.body.items[3].postInfo.id).toEqual(secondCreatedPostId)

        expect(allCommentsData.body.items[0].likesInfo).toBeDefined()
        expect(allCommentsData.body.items[1].likesInfo).toBeDefined()
        expect(allCommentsData.body.items[2].likesInfo).toBeDefined()
        expect(allCommentsData.body.items[3].likesInfo).toBeDefined()
    })

    const unbanUserForBlogInputModel: BanUserForBlogInputModel = {
        isBanned: false,
        banReason: 'you are unbanned for this test', // min 10 max 1000
        blogId: ''
    }

    it('should unban another user', async () => {
        unbanUserForBlogInputModel.blogId = createdBlogId

        await request(httpServer)
            .put(`/blogger/users/${anotherUserId}/ban`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(unbanUserForBlogInputModel)
            .expect(HttpStatus.NO_CONTENT)
    })

    it(`should create comments for posts, if this user is unbanned for blog`, async () => {
        await request(httpServer)
            .post(`/posts/${createdPostId}/comments`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.CREATED)

        await request(httpServer)
            .post(`/posts/${secondCreatedPostId}/comments`)
            .set('Authorization', `Bearer ${secondRecievedAccessToken}`)
            .send(commentInputModel)
            .expect(HttpStatus.CREATED)

        const allCommentsData = await request(httpServer)
            .get('/blogger/blogs/comments?sortDirection=asc')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(allCommentsData.body.items.length).toEqual(6)
        expect(allCommentsData.body.items[0].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[1].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[2].postInfo.id).toEqual(secondCreatedPostId)
        expect(allCommentsData.body.items[3].postInfo.id).toEqual(secondCreatedPostId)
        expect(allCommentsData.body.items[4].postInfo.id).toEqual(createdPostId)
        expect(allCommentsData.body.items[5].postInfo.id).toEqual(secondCreatedPostId)

        expect(allCommentsData.body.items[0].likesInfo.likesCount).toEqual(0)
        expect(allCommentsData.body.items[0].likesInfo.dislikesCount).toEqual(0)

        expect(allCommentsData.body.items[1].likesInfo.likesCount).toEqual(0)
        expect(allCommentsData.body.items[1].likesInfo.dislikesCount).toEqual(0)

        expect(allCommentsData.body.items[2].likesInfo.likesCount).toEqual(0)
        expect(allCommentsData.body.items[2].likesInfo.dislikesCount).toEqual(0)

        expect(allCommentsData.body.items[3].likesInfo.likesCount).toEqual(0)
        expect(allCommentsData.body.items[3].likesInfo.dislikesCount).toEqual(0)
    })

    it(`should display all comments for blogger with sorting`, async () => {
        const allCommentsData = await request(httpServer)
            .get('/blogger/blogs/comments?pageNumber=2&pageSize=2&sortDirection=asc')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(allCommentsData.body.items.length).toEqual(2)
        expect(allCommentsData.body.items[0].postInfo.id).toEqual(secondCreatedPostId)
        expect(allCommentsData.body.items[1].postInfo.id).toEqual(secondCreatedPostId)

        expect(allCommentsData.body.totalCount).toEqual(6)
        expect(allCommentsData.body.pagesCount).toEqual(3)
        expect(allCommentsData.body.page).toEqual(2)
    })
})