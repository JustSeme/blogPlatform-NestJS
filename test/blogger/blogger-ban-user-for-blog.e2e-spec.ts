import { initAppAndGetHttpServer } from "../test-utils";
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { BlogInputModel } from "../../src/Blogger/api/models/BlogInputModel";
import { BanUserForBlogInputModel } from "../../src/Blogger/api/models/BanUserForBlogInputModel";
import { UserInputModel } from "../../src/SuperAdmin/api/models/users/UserInputModel";

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
    let userId1
    let userId2
    let userId3

    const createBloggerInputModel: UserInputModel = {
        login: 'blogger',
        password: 'password',
        email: 'blogger@email.ru'
    }

    const userInputModel1: UserInputModel = {
        login: 'user',
        password: 'password',
        email: 'user@email.ru'
    }

    const userInputModel2: UserInputModel = {
        login: 'user2',
        password: 'password',
        email: 'user2@email.ru'
    }

    const userInputModel3: UserInputModel = {
        login: 'user3',
        password: 'password',
        email: 'user3@email.ru'
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

    it('should create 3 users for get userIds for ban it', async () => {
        const userData1 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userInputModel1)
            .expect(HttpStatus.CREATED)

        userId1 = userData1.body.id

        const userData2 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userInputModel2)
            .expect(HttpStatus.CREATED)

        userId2 = userData2.body.id

        const userData3 = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userInputModel3)
            .expect(HttpStatus.CREATED)

        userId3 = userData3.body.id
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

    let userId1FromBanList

    it('blogger should ban user for current blog and user should appear in ban list', async () => {
        await request(httpServer)
            .put(`/blogger/users/${userId1}/ban`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(banInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const bannedUsersForBlogData = await request(httpServer)
            .get(`/blogger/users/blog/${blogId}`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .expect(HttpStatus.OK)

        expect(bannedUsersForBlogData.body.items.length).toEqual(1)
        expect(bannedUsersForBlogData.body.items[0].id).toEqual(userId1)
        expect(bannedUsersForBlogData.body.items[0].banInfo.isBanned).toEqual(true)
        expect(bannedUsersForBlogData.body.items[0].banInfo.banReason).toEqual(banInputModel.banReason)

        userId1FromBanList = bannedUsersForBlogData.body.items[0].id
    })

    const unbanInputModel: BanUserForBlogInputModel = {
        isBanned: false,
        banReason: 'someone reason for unban user',
        blogId
    }

    it('blogger should unban user for current blog and user should disappear in ban list', async () => {
        await request(httpServer)
            .put(`/blogger/users/${userId1FromBanList}/ban`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(unbanInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const bannedUsersForBlogData = await request(httpServer)
            .get(`/blogger/users/blog/${blogId}`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .expect(HttpStatus.OK)

        expect(bannedUsersForBlogData.body.items.length).toEqual(0)
    })

    let userId2FromBanList, userId3FromBanList

    it('blogger should ban another two users and ban list should contain that two users', async () => {
        await request(httpServer)
            .put(`/blogger/users/${userId2}/ban`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(banInputModel)
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/blogger/users/${userId3}/ban`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .send(banInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const bannedUsersForBlogData = await request(httpServer)
            .get(`/blogger/users/blog/${blogId}?sortDirection=ASC`)
            .set('Authorization', `Bearer ${bloggerAccessToken}`)
            .expect(HttpStatus.OK)

        // check user1 is not banned
        expect(bannedUsersForBlogData.body.items.length).toEqual(2)

        //check user2 is banned
        expect(bannedUsersForBlogData.body.items[0].id).toEqual(userId2)
        expect(bannedUsersForBlogData.body.items[0].banInfo.isBanned).toEqual(true)
        expect(bannedUsersForBlogData.body.items[0].banInfo.banReason).toEqual(banInputModel.banReason)

        //check user3 is banned
        expect(bannedUsersForBlogData.body.items[1].id).toEqual(userId3)
        expect(bannedUsersForBlogData.body.items[1].banInfo.isBanned).toEqual(true)
        expect(bannedUsersForBlogData.body.items[1].banInfo.banReason).toEqual(banInputModel.banReason)

        userId2FromBanList = bannedUsersForBlogData.body.items[0].id
        userId3FromBanList = bannedUsersForBlogData.body.items[1].id
    })
})