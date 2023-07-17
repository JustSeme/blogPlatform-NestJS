import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { initAppAndGetHttpServer } from '../test-utils';
import { QuestionInputModel } from '../../src/SuperAdmin/api/models/quiz/QuestionInputModel'
import { PublishQuestionInputModel } from '../../src/SuperAdmin/api/models/quiz/PublishInputModel'


describe('super-admin-quiz', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    const questionInputModel: QuestionInputModel = {
        body: 'What year today?', // min 10 max 500
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
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
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

    const incorrectPublishInputModel = {
        published: 'true'
    }

    it(`shouldn't to publish early created question if inputModel is incorrect`, async () => {
        const errorsMessages = await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}/publish`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectPublishInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessages.body).toEqual({
            errorsMessages: [{
                message: 'published must be a boolean value',
                field: 'published'
            }]
        })

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    const publishInputModel: PublishQuestionInputModel = {
        published: true
    }

    it(`shouldn't to publish early created question if question is not found`, async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/incorrect/publish`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(publishInputModel)
            .expect(HttpStatus.NOT_FOUND)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it(`shouldn't to publish early created question if auth header is not passed`, async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}/publish`)
            .send(publishInputModel)
            .expect(HttpStatus.UNAUTHORIZED)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it('should to publish early created question - update publish to true', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}/publish`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(publishInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        createdQuestionExpectModel.published = true

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    const updateModelWithEmptyAnswersArray: QuestionInputModel = {
        body: 'any should be greater then 10',
        correctAnswers: []
    }

    it(`shouldn't update question if correctAnswers is empty and question is already published`, async () => {
        const errorsMessages = await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(updateModelWithEmptyAnswersArray)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessages.body).toEqual({
            errorsMessages: [{
                message: `You can't set empty correctAnswers array - this question is published`,
                field: 'correctAnswers'
            }]
        })

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    const unpublishInputModel: PublishQuestionInputModel = {
        published: false
    }

    it('should to unpublish early created question - update publish to false', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}/publish`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(unpublishInputModel)
            .expect(HttpStatus.NO_CONTENT)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        createdQuestionExpectModel.published = false

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it(`should update question correctAnswers to empty array because question is not published`, async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(updateModelWithEmptyAnswersArray)
            .expect(HttpStatus.NO_CONTENT)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        createdQuestionExpectModel.correctAnswers = []
        createdQuestionExpectModel.body = updateModelWithEmptyAnswersArray.body

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it('shouldn\'t delete question if question id incorrect', async () => {
        await request(httpServer)
            .delete(`/sa/quiz/questions/incorrect`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NOT_FOUND)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it('shouldn\'t delete question if auth header is incorrect', async () => {
        await request(httpServer)
            .delete(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic incorrect')
            .expect(HttpStatus.UNAUTHORIZED)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.items[0]).toEqual(createdQuestionExpectModel)
    })

    it('should delete early created question', async () => {
        await request(httpServer)
            .delete(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NO_CONTENT)

        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body.totalCount).toEqual(0)
        expect(questionsData.body.items.length).toEqual(0)
    })

    it('shouldn\'t delete early deleted question', async () => {
        const errorsMessages = await request(httpServer)
            .delete(`/sa/quiz/questions/${questionId1}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NOT_FOUND)

        expect(errorsMessages.body).toEqual({
            errorsMessages: [{
                message: 'Question by questionId parameter is not exists',
                field: 'questionId'
            }]
        })
    })
})