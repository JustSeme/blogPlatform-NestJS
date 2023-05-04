import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/createApp';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { UserInputModel } from '../../src/SuperAdmin/api/models/UserInputModel';
import { BanInputModel } from '../../src/SuperAdmin/api/models/BanInputModel'
import { LoginInputDTO } from '../../src/auth/api/models/LoginInputDTO'
import { BlogInputModel } from '../../src/blogs/api/models/BlogInputModel';
import { PostInputModelWithoutBlogId } from '../../src/blogs/api/models/PostInputModelWithoutBlogId';
import { CommentInputModel } from '../../src/blogs/api/models/CommentInputModel';

const generateEmail = (str: string) => `${str}@mail.ru`

describe('super-admin-users', () => {
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

    const correctUserInputData: UserInputModel = {
        login: 'justSeme',
        password: '123123123',
        email: 'semyn03@mail.ru'
    }

    const incorrectUserInputData: UserInputModel = {
        login: 'overTenSymbols',
        password: 'overTwentySymbolsForItsToBeIncorrect',
        email: 'itsJustNotEmail"email,com'
    }

    it(`shouldn't create new user without basic auth token`, async () => {
        await request(httpServer)
            .post(`/sa/users`)
            .send(correctUserInputData)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it(`shouldn't create new user with incorrect input data`, async () => {
        const response = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectUserInputData)
            .expect(HttpStatus.BAD_REQUEST)

        expect(response.body).toEqual({
            errorsMessages: [
                {
                    "message": "login must be shorter than or equal to 10 characters",
                    "field": "login"
                },
                {
                    "message": "password must be shorter than or equal to 20 characters",
                    "field": "password"
                },
                {
                    "message": "email must be an email",
                    "field": "email"
                }
            ]
        })
    })

    let createdUser: any
    it('should create new user with basic auth token', async () => {
        const response = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(correctUserInputData)
            .expect(HttpStatus.CREATED)

        const { id, login, email, createdAt } = response.body
        createdUser = response.body

        expect(typeof id).toBe('string')
        expect(typeof login).toBe('string')
        expect(typeof email).toBe('string')
        expect(typeof createdAt).toBe('string')
    })

    it('should return array with one created user', async () => {
        const response = await request(httpServer)
            .get(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 1).toBe(true)
        expect(response.body.items[0]).toEqual(createdUser)
    })

    const thirdUser = {
        login: 'ghi',
        password: '123123123',
        email: generateEmail('justCena')
    }

    const fourthUser = {
        login: 'sas',
        password: '123456123456',
        email: generateEmail('sasssa')
    }

    it('should create fourth user', async () => {
        await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(fourthUser)
            .expect(HttpStatus.CREATED)
    })

    let id1: string, id2: string, id3: string
    it('should create three users and return error if email adress and login is already use', async () => {
        const firstUser = {
            login: 'abc',
            password: '123123123',
            email: generateEmail('JohnCena')
        }
        const secondUser = {
            login: 'def',
            password: '123123123',
            email: generateEmail('JohnDoe')
        }

        const response1 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(firstUser)
            .expect(HttpStatus.CREATED)
        expect(typeof response1.body.id).toBe('string')
        id1 = response1.body.id

        const response2 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(secondUser)
            .expect(HttpStatus.CREATED)
        expect(typeof response2.body.id).toBe('string')
        id2 = response2.body.id

        const response3 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(thirdUser)
            .expect(HttpStatus.CREATED)
        expect(typeof response3.body.id).toBe('string')
        id3 = response3.body.id

        const response4 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(secondUser)
            .expect(HttpStatus.BAD_REQUEST)
        expect(response4.body).toEqual({
            errorsMessages: [
                {
                    "message": "Login already in use",
                    "field": "login"
                },
                {
                    "message": "Email already in use",
                    "field": "email"
                }
            ]
        })
    })

    it('should return array of users with asc sorting for login', async () => {
        const response = await request(httpServer)
            .get(`/sa/users?sortDirection=asc&sortBy=login`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 5).toBe(true)

        expect(response.body.items[0].id).toEqual(id1)
        expect(response.body.items[1].id).toEqual(id2)
        expect(response.body.items[2].id).toEqual(id3)
        expect(response.body.items[3].id).toEqual(createdUser.id)
    })

    it('should return two users with email regex John', async () => {
        const response = await request(httpServer)
            .get(`/sa/users?searchEmailTerm=John&sortDirection=asc`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 2).toBe(true)

        expect(response.body.items[0].id).toBe(id1)
        expect(response.body.items[1].id).toBe(id2)
    })

    it('should delete two users by id', async () => {
        await request(httpServer)
            .delete(`/sa/users/${id1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .delete(`/sa/users/${id2}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NO_CONTENT)

        const response = await request(httpServer)
            .get(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 3).toBe(true)
    })

    it('should return a error if user is already deleted', async () => {
        await request(httpServer)
            .delete(`/sa/users/${id1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NOT_FOUND)
    })

    let recievedAccessToken
    let recievedRefreshToken
    it(`should login user, getting accessToken, refreshToken`, async () => {
        const loginInputData: LoginInputDTO = {
            loginOrEmail: thirdUser.login,
            password: thirdUser.password
        }

        const tokensData = await request(httpServer)
            .post('/auth/login')
            .send(loginInputData)
            .expect(HttpStatus.OK)

        recievedAccessToken = tokensData.body.accessToken
        recievedRefreshToken = tokensData.header['set-cookie']
    })

    let secondAccessToken
    let secondRefreshToken
    it(`should login another user, getting accessToken, refreshToken`, async () => {
        const loginInputData: LoginInputDTO = {
            loginOrEmail: fourthUser.login,
            password: fourthUser.password
        }

        const tokensData = await request(httpServer)
            .post('/auth/login')
            .send(loginInputData)
            .expect(HttpStatus.OK)

        secondAccessToken = tokensData.body.accessToken
        secondRefreshToken = tokensData.header['set-cookie']
    })

    it('should return one active session for user', async () => {
        const sessionsData = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', recievedRefreshToken)
            .expect(HttpStatus.OK)

        expect(sessionsData.body.length).toBe(1)
    })

    const incorrectBanInputModel = {
        isBanned: 'not a boolean',
        banReason: 'lowerThen20'
    }

    it('shouldn\'t ban the last created user if inputModel has incorrect values, should display unbanned banInfo', async () => {
        const errorsMessagesData = await request(httpServer)
            .put(`/sa/users/${id3}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectBanInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessagesData.body.errorsMessages[0].field).toEqual('isBanned')
        expect(errorsMessagesData.body.errorsMessages[0].message).toEqual('isBanned must be a boolean value')
        expect(errorsMessagesData.body.errorsMessages[1].field).toEqual('banReason')
        expect(errorsMessagesData.body.errorsMessages[1].message).toEqual('banReason must be longer than or equal to 20 characters')

        const usersData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersData.body.items[0].banInfo.isBanned).toEqual(false)
        expect(usersData.body.items[0].banInfo.banReason).toEqual(null)
    })

    const banInputModel: BanInputModel = {
        isBanned: true,
        banReason: 'bad guy this reason should be greather then 20 symbols'
    }

    it('shouldn\'t ban the last created user if auth header is not provided, should display unbanned banInfo', async () => {
        await request(httpServer)
            .put(`/sa/users/${id3}/ban`)
            .send(banInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        const usersData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersData.body.items[0].banInfo.isBanned).toEqual(false)
        expect(usersData.body.items[0].banInfo.banReason).toEqual(null)
    })

    it('shouldn\'t ban the last created user if userId from param is incorrect, should display unbanned banInfo', async () => {
        await request(httpServer)
            .put(`/sa/users/incorrect/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(banInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        const usersData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersData.body.items[0].banInfo.isBanned).toEqual(false)
        expect(usersData.body.items[0].banInfo.banReason).toEqual(null)
    })

    const correctBlogInputModel: BlogInputModel = {
        name: 'Test Blog name',
        description: 'Test Blog description',
        websiteUrl: 'www.url.com',
    };

    const correctPostInputModel: PostInputModelWithoutBlogId = {
        title: 'correct title', // min 3 max 30
        shortDescription: 'short desc', // min 3 max 100
        content: 'this is a content' // min 3 max 1000
    }

    const correctCommentBody: CommentInputModel = {
        content: 'this content should be a correct' // min 20 max 300
    }

    let secondPostId
    let secondCommentId

    it('another user should create post and comment in order for the user to create likes', async () => {
        const createdBlogData = await request(httpServer)
            .post('/blogger/blogs')
            .set('Authorization', `Bearer ${secondAccessToken}`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdBlogData.body.name).toEqual(correctBlogInputModel.name)
        expect(createdBlogData.body.description).toEqual(correctBlogInputModel.description)
        expect(createdBlogData.body.websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
        expect(createdBlogData.body.creatorId).toBe(undefined)

        const createdBlogId = createdBlogData.body.id

        const createdPostData = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${secondAccessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdPostData.body.title).toEqual(correctPostInputModel.title)
        expect(createdPostData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(createdPostData.body.content).toEqual(correctPostInputModel.content)

        secondPostId = createdPostData.body.id

        const postsViewData = await request(httpServer)
            .get(`/posts`)
            .expect(HttpStatus.OK)

        expect(postsViewData.body.items[0].title).toEqual(correctPostInputModel.title)
        expect(postsViewData.body.items[0].shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postsViewData.body.items[0].content).toEqual(correctPostInputModel.content)

        const createdCommentResponseData = await request(httpServer)
            .post(`/posts/${secondPostId}/comments`)
            .set('Authorization', `Bearer ${secondAccessToken}`)
            .send(correctCommentBody)
            .expect(HttpStatus.CREATED)

        secondCommentId = createdCommentResponseData.body.id
    })

    let createdCommentId = ''
    let createdPostId = ''

    it('user should create blog, post and comment for post, entities should be displayed', async () => {
        const createdBlogData = await request(httpServer)
            .post('/blogger/blogs')
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctBlogInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdBlogData.body.name).toEqual(correctBlogInputModel.name)
        expect(createdBlogData.body.description).toEqual(correctBlogInputModel.description)
        expect(createdBlogData.body.websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
        expect(createdBlogData.body.creatorId).toBe(undefined)

        const createdBlogId = createdBlogData.body.id

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

        const createdCommentResponseData = await request(httpServer)
            .post(`/posts/${createdPostId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send(correctCommentBody)
            .expect(HttpStatus.CREATED)

        createdCommentId = createdCommentResponseData.body.id
    })

    it('should like/dislike early created post and comment, should display correct info', async () => {
        await request(httpServer)
            .put(`/comments/${secondCommentId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'Like'
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/posts/${secondPostId}/like-status`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .send({
                likeStatus: 'Dislike'
            })
            .expect(HttpStatus.NO_CONTENT)

        const commentsData = await request(httpServer)
            .get(`/posts/${secondPostId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(commentsData.body.items[0].likesInfo.likesCount).toEqual(1)

        const postData = await request(httpServer)
            .get(`/posts/${secondPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(postData.body.extendedLikesInfo.dislikesCount).toEqual(1)
    })

    it('should ban the last created user and display banned banInfo', async () => {
        await request(httpServer)
            .put(`/sa/users/${id3}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(banInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const usersData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersData.body.items[0].banInfo.isBanned).toEqual(true)
        expect(usersData.body.items[0].banInfo.banReason).toEqual(banInputModel.banReason)
    })

    it('shouldn\'t display the post and comment of the banned user', async () => {
        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.NOT_FOUND)

        await request(httpServer)
            .get(`/comments/${createdCommentId}`)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('shouldn\'t display likes/dislikes of the banned user', async () => {
        const commentsData = await request(httpServer)
            .get(`/posts/${secondPostId}/comments`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(commentsData.body.items[0].likesInfo.likesCount).toEqual(0)

        const postData = await request(httpServer)
            .get(`/posts/${secondPostId}`)
            .set('Authorization', `Bearer ${recievedAccessToken}`)
            .expect(HttpStatus.OK)

        expect(postData.body.extendedLikesInfo.dislikesCount).toEqual(0)
    })

    it('should return 401 error becouse banned user devices is deleted', async () => {
        const errorsMessagesData = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', recievedRefreshToken)
            .expect(HttpStatus.UNAUTHORIZED)

        expect(errorsMessagesData.body.errorsMessages).toEqual('refreshToken is incorrect')
    })

    const unbanInputModel: BanInputModel = {
        isBanned: false,
        banReason: 'You re forgiven this reason should be greather then 20 symbols'
    }

    const loginInputData = new LoginInputDTO(thirdUser.login, thirdUser.password)

    it('user shouldn\'t login if he is banned', async () => {
        const errorsMessages = await request(httpServer)
            .post('/auth/login')
            .send(loginInputData)
            .expect(HttpStatus.UNAUTHORIZED)

        expect(errorsMessages.body.errorsMessages[0].field).toEqual('userId')
        expect(errorsMessages.body.errorsMessages[0].message).toEqual(`You are banned by banReason: ${banInputModel.banReason}`)
    })

    it('should unban the last created user and display unbanned banInfo', async () => {
        await request(httpServer)
            .put(`/sa/users/${id3}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(unbanInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const usersData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersData.body.items[0].banInfo.isBanned).toEqual(false)
        expect(usersData.body.items[0].banInfo.banReason).toEqual(null)
        expect(usersData.body.items[0].banInfo.banDate).toEqual(null)
    })

    it('user should login if he is unbanned', async () => {
        await request(httpServer)
            .post('/auth/login')
            .send(loginInputData)
            .expect(HttpStatus.OK)
    })
});
