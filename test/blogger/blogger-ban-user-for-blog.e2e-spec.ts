import { initAppAndGetHttpServer } from "../test-utils";
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UserInputModel } from "../../src/SuperAdmin/api/models/UserInputModel";
import { BlogInputModel } from "../../src/Blogger/api/models/BlogInputModel";
import { BanUserForBlogInputModel } from "../../src/Blogger/api/models/BanUserForBlogInputModel";

describe('blogger-ban-user-for-blog', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    afterAll(async () => {
        //await app.close();
    });

    let bloggerAccessToken = ''
    let bloggerId
    let userId

    const createBloggerInputModel: UserInputModel = {
        login: 'blogger',
        password: 'password',
        email: 'blogger@email.ru'
    }

    const userInputModel: UserInputModel = {
        login: 'user',
        password: 'password',
        email: 'user@email.ru'
    }

    it('should create blogger and should login, getting access token', async () => {
        const createdUserData = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createBloggerInputModel)
            .expect(HttpStatus.CREATED)

        bloggerId = createdUserData.body.id

        const accesTokenData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createBloggerInputModel.login,
                password: createBloggerInputModel.password
            })
            .expect(HttpStatus.OK)

        bloggerAccessToken = accesTokenData.body.accessToken
    })

    it('should create user for get userId for ban it', async () => {
        const userData = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userInputModel)
            .expect(HttpStatus.CREATED)

        userId = userData.body.id
    })

    const createBlogInputModel: BlogInputModel = {
        description: 'description',
        name: 'name',
        websiteUrl: 'www.website.com'
    }

    let blogId

    it('should create blog', async () => {
        const createdBlog = await request(httpServer)
            .post('/blogger/blogs')
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(createBlogInputModel)
            .expect(HttpStatus.CREATED)

        blogId = createdBlog.body.id
    })

    it('should check that no one user is banned for current blog', async () => {
        const bannedUsersForBlogData = await request(httpServer)
            .get(`/blogger/users/blog/${blogId}`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .expect(HttpStatus.OK)

        expect(bannedUsersForBlogData.body.items.length).toEqual(0)
    })

    const banInputModel: BanUserForBlogInputModel = {
        isBanned: true,
        banReason: 'someone reason for ban user',
        blogId
    }

    let userIdForBanList

    it('blogger should ban user for current blog and user should appear in ban list', async () => {
        await request(httpServer)
            .put(`/blogger/users/${userId}/ban`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(banInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const bannedUsersForBlogData = await request(httpServer)
            .get(`/blogger/users/blog/${blogId}`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .expect(HttpStatus.OK)

        expect(bannedUsersForBlogData.body.items.length).toEqual(1)
        expect(bannedUsersForBlogData.body.items[0].id).toEqual(userId)
        expect(bannedUsersForBlogData.body.items[0].banInfo.isBanned).toEqual(true)
        expect(bannedUsersForBlogData.body.items[0].banInfo.banReason).toEqual(banInputModel.banReason)

        userIdForBanList = bannedUsersForBlogData.body.items[0].id
    })

    const unbanInputModel: BanUserForBlogInputModel = {
        isBanned: false,
        banReason: 'someone reason for unban user',
        blogId
    }

    it('blogger should unban user for current blog and user should disappear in ban list', async () => {
        await request(httpServer)
            .put(`/blogger/users/${userIdForBanList}/ban`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(unbanInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const bannedUsersForBlogData = await request(httpServer)
            .get(`/blogger/users/blog/${blogId}`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .expect(HttpStatus.OK)

        expect(bannedUsersForBlogData.body.items[0].banInfo.isBanned).toEqual(false)
    })
})