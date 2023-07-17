import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { initAppAndGetHttpServer } from '../test-utils';
import { QuestionInputModel } from '../../src/SuperAdmin/api/models/QuestionInputModel'


describe('super-admin-users', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    const incorrectQuestionInputModel: QuestionInputModel = {
        body: 'How', // min 10 max 500
        correctAnswers: [] // is string array
    }

    it('should return error if correctAnswers array is empty', async () => {
        const errorsMessages = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectQuestionInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessages.body).toEqual({
            errorsMessages: [
                {
                    message: 'any',
                    field: 'any'
                },
                {
                    message: 'any',
                    field: 'any'
                },
            ]
        })
    })

    const incorrectQuestionInputModel2 = {
        body: 'Body should be greater then 10 symbols', // min 10 max 500
        correctAnswers: [true, 42, {
            firstName: 'user',
            lastName: 'user'
        }] // is string array
    }

    it('should return error if correctAnswers array contains not a string', async () => {
        const errorsMessages = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectQuestionInputModel2)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessages.body).toEqual({
            errorsMessages: [
                {
                    message: 'any',
                    field: 'any'
                },
            ]
        })
    })

    const questionInputModel: QuestionInputModel = {
        body: 'How year today?', // min 10 max 500
        correctAnswers: ['2023', 'две тысячи двадцать третий', 'two thousand twenty-third'] // is string array
    }

    it('should return error if basic auth is incorrect', async () => {
        const createdQuestion = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic incorrect')
            .send(questionInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        expect(createdQuestion.body).toEqual({
            errorsMessages: [
                {
                    message: 'any',
                    field: 'any'
                },
            ]
        })
    })

    let questionId1

    it('super admin should create question and in the response the created question', async () => {
        const createdQuestion = await request(httpServer)
            .post('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(questionInputModel)
            .expect(HttpStatus.CREATED)

        expect(createdQuestion.body).toEqual({
            ...questionInputModel,
            published: false,
            id: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        })

        questionId1 = createdQuestion.body.id
    })

    /* it('created question should appear in questions list', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0].id).toEqual(questionId1)
    }) */
})