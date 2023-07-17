import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { initAppAndGetHttpServer } from '../test-utils';
import { QuestionInputModel } from '../../src/SuperAdmin/api/models/quiz/QuestionInputModel'


describe('super-admin-quiz', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    const questionInputModel: QuestionInputModel = {
        body: 'How year today?', // min 10 max 500
        correctAnswers: ['2023', 'две тысячи двадцать третий', 'two thousand twenty-third'] // is string array
    }

    it('should return error if basic auth is incorrect', async () => {
        await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic incorrect')
            .send(questionInputModel)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    let questionId1

    const createdQuestionExpectModel = {
        ...questionInputModel,
        published: false,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
    }

    it('super admin should create question and in the response the created question', async () => {
        const createdQuestion = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(questionInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdQuestion.body).toEqual(createdQuestionExpectModel)

        questionId1 = createdQuestion.body.id
    })

    it('shouldn\'t display questions if auth header is not provided', async () => {
        await request(httpServer)
            .get('/sa/quiz/questions')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('created question should appear in questions list', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        createdQuestionExpectModel.id = questionId1

        expect(questionsData.body.totalCount).toEqual(1)
        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    const updateQuestionInputModel: QuestionInputModel = {
        body: 'updated question body',
        correctAnswers: ['answer 1', 'answer 2']
    }

    it('shouldn\'t update early created question if it is not found, should display correct info', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/incorrect`)
            .send(updateQuestionInputModel)
            .expect(HttpStatus.NOT_FOUND)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it('shouldn\'t update early created question if auth header is not passed, should display correct info', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}`)
            .send(updateQuestionInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    const incorrectUpdateModel: QuestionInputModel = {
        body: 'low',
        correctAnswers: ['answer 1', 'answer 2']
    }

    it('shouldn\'t update early created question if inputModel has incorrect values, should display correct info', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectUpdateModel)
            .expect(HttpStatus.BAD_REQUEST)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it('should update early created question and should display correct info', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(updateQuestionInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        createdQuestionExpectModel.id = questionId1
        createdQuestionExpectModel.body = updateQuestionInputModel.body
        createdQuestionExpectModel.correctAnswers = updateQuestionInputModel.correctAnswers

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })
})