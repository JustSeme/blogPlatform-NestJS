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
})