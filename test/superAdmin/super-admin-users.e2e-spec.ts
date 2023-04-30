import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/createApp';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { UserInputModel } from '../../src/SuperAdmin/api/models/UserInputModel';
import { BanInputModel } from '../../src/SuperAdmin/api/models/BanInputModel'

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
        const thirdUser = {
            login: 'ghi',
            password: '123123123',
            email: generateEmail('justCena')
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

        expect(response.body.totalCount === 4).toBe(true)

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

        expect(response.body.totalCount === 2).toBe(true)
    })

    it('should return a error if user is already deleted', async () => {
        await request(httpServer)
            .delete(`/sa/users/${id1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NOT_FOUND)
    })

    const incorrectBanInputModel = {
        isBanned: 'not a boolean',
        banReason: 'this reason should be greater then 20 symbols'
    }

    it('shouldn\'t ban the last created user if inputModel has incorrect values, should display unbanned banInfo', async () => {
        await request(httpServer)
            .put(`/sa/users/${id3}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectBanInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        const usersData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersData.body.items[0].banInfo.isBanned).toEqual(false)
        expect(usersData.body.items[0].banInfo.banReason).toEqual('not banned')
    })

    const banInputModel: BanInputModel = {
        isBanned: true,
        banReason: 'bad guy'
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
        expect(usersData.body.items[0].banInfo.banReason).toEqual('not banned')
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
        expect(usersData.body.items[0].banInfo.banReason).toEqual('not banned')
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

    const unbanInputModel: BanInputModel = {
        isBanned: false,
        banReason: 'You re forgiven'
    }

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
        expect(usersData.body.items[0].banInfo.banReason).toEqual(unbanInputModel.banReason)
    })
});
