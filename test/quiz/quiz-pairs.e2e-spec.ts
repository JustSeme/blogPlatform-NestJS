import { UserInputModel } from "../../src/SuperAdmin/api/models/users/UserInputModel";
import { QuestionInputModel } from "../../src/SuperAdmin/api/models/questions/QuestionInputModel";
import { HttpStatus } from '@nestjs/common'
import request from "supertest";
import { LoginInputDTO } from '../../src/auth/api/models/LoginInputDTO'
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { createApp } from "../../src/createApp";
import { funcSleep } from "../../src/general/helpers/helpers";

describe('quiz-pairs', () => {
    let httpServer;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        let app: NestExpressApplication;
        app = moduleFixture.createNestApplication()
        app = createApp(app)

        await app.init()

        jest.spyOn(console, 'error')
        // @ts-ignore jest.spyOn adds this functionallity
        console.error.mockImplementation(() => null);

        httpServer = app.getHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    const questionInputModel1: QuestionInputModel = {
        body: 'A.What year today?', // min 10 max 500
        correctAnswers: ['2023', 'две тысячи двадцать третий', 'two thousand twenty-third'] // is string array
    }

    const questionInputModel2: QuestionInputModel = {
        body: 'B.How much 2 + 2', // min 10 max 500
        correctAnswers: ['4', 'четыре', 'four'] // is string array
    }

    const questionInputModel3: QuestionInputModel = {
        body: 'C.Where is Niger country?', // min 10 max 500
        correctAnswers: ['Africa', 'Африка'] // is string array
    }

    const questionInputModel4: QuestionInputModel = {
        body: 'D.When salvery was abolishhed in Russia?', // min 10 max 500
        correctAnswers: ['2047', 'Никогда', 'Never'] // is string array
    }

    let questionId1, questionId2, questionId3, questionId4

    it('should create 4 questions', async () => {
        const createdQuestion1 = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(questionInputModel1)
            .expect(HttpStatus.CREATED)

        questionId1 = createdQuestion1.body.id

        const createdQuestion2 = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(questionInputModel2)
            .expect(HttpStatus.CREATED)

        questionId2 = createdQuestion2.body.id

        const createdQuestion3 = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(questionInputModel3)
            .expect(HttpStatus.CREATED)

        questionId3 = createdQuestion3.body.id

        const createdQuestion4 = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(questionInputModel4)
            .expect(HttpStatus.CREATED)

        questionId4 = createdQuestion4.body.id
    })

    const userInputData1: UserInputModel = {
        login: 'justSeme',
        password: '123123123',
        email: 'semyn03@mail.ru'
    }

    let userId1, userLogin1
    it('should create new user with basic auth token', async () => {
        const response = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(userInputData1)
            .expect(HttpStatus.CREATED)

        const { id, login } = response.body
        userId1 = id
        userLogin1 = login
    })

    let accessToken1
    it('should login user 1, getting access token', async () => {
        const loginInputModel: LoginInputDTO = {
            loginOrEmail: userInputData1.login,
            password: userInputData1.password
        }

        const tokensData = await request(httpServer)
            .post('/auth/login')
            .send(loginInputModel)
            .expect(HttpStatus.OK)

        accessToken1 = tokensData.body.accessToken
    })

    it('should return 401 error if bearer token is not correct', async () => {
        await request(httpServer)
            .post('/pair-game-quiz/pairs/connection')
            .set('Authorization', `Bearer incorrect`)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should create new pair with status "PendingSecondPlayer" and return pair data', async () => {
        const pairData = await request(httpServer)
            .post('/pair-game-quiz/pairs/connection')
            .set('Authorization', `Bearer ${accessToken1}`)
            .expect(HttpStatus.OK)

        funcSleep(1000)

        expect(pairData.body).toEqual({
            id: expect.any(String),
            firstPlayerProgress: {
                answers: [],
                player: {
                    id: userId1,
                    login: userLogin1,
                },
                score: 0
            },
            secondPlayerProgress: null,
            questions: null,
            status: 'PendingSecondPlayer',
            pairCreatedDate: expect.any(String),
            startGameDate: null,
            finishGameDate: null,
        })

        expect(new Date(pairData.body.pairCreatedDate) < new Date()).toEqual(true)
    })

    it('should return 403 error if user already waiting ', async () => {
        const errorsMessages = await request(httpServer)
            .post('/pair-game-quiz/pairs/connection')
            .set('Authorization', `Bearer ${accessToken1}`)
            .expect(HttpStatus.FORBIDDEN)

        expect(errorsMessages.body).toEqual({
            errorsMessages: [{
                message: 'any',
                field: 'any'
            }]
        })
    })
})