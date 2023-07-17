import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { QuestionInputModel } from "../../src/SuperAdmin/api/models/quiz/QuestionInputModel";
import { initAppAndGetHttpServer } from "../test-utils";

describe('quiz-questions-pagination', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

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

    const defaultExpectData = {
        id: expect.any(String),
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
    }

    const questionsExpectData = [{
        ...questionInputModel1,
        ...defaultExpectData
    }, {
        ...questionInputModel2,
        ...defaultExpectData
    }, {
        ...questionInputModel3,
        ...defaultExpectData
    }, {
        ...questionInputModel4,
        ...defaultExpectData,
    }]

    it('should return created questions', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?sortDirection=ASC')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: questionsExpectData
        })
    })

    it('should reverse items result if passed sortDirection DESC', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?sortDirection=DESC')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: [...questionsExpectData].reverse()
        })
    })

    it('should return items with sorting by body name', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?sortBy=body')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: [...questionsExpectData].reverse()
        })
    })

    it('should return items by bodySearchTerm', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?bodySearchTerm=What')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [questionsExpectData[0]]
        })
    })

    it('should return items by bodySearchTerm', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?bodySearchTerm=How')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [questionsExpectData[1]]
        })
    })

    it('should return items by bodySearchTerm', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?bodySearchTerm=Where')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [questionsExpectData[2]]
        })
    })

    it('should return items by bodySearchTerm', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?bodySearchTerm=When')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [questionsExpectData[3]]
        })
    })

    it('should return correct pageSize and pagesCount data with passed pageSize param, should return correct items for pageNumber=2', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?pageSize=2&sortDirection=ASC&pageNumber=2')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 2,
            page: 2,
            pageSize: 2,
            totalCount: 4,
            items: [...questionsExpectData].splice(2, 2) // that returns items by indexes 2 and 3
        })
    })

    it('should publish two questions', async () => {
        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId1}/publish`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({ published: true })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .put(`/sa/quiz/questions/${questionId2}/publish`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({ published: true })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('should return only published questions', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?sortDirection=ASC&publishedStatus=published')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        const expectData = [...questionsExpectData].splice(0, 2).map(question => {
            question.published = true
            question.updatedAt = expect.any(String)
            return question
        })

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: expectData // that returns items by indexes 2 and 3
        })
    })

    it('should return only unpublished questions', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?sortDirection=ASC&publishedStatus=notPublished')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: [...questionsExpectData].splice(2, 2) // that returns items by indexes 2 and 3
        })
    })

    it('should return all questions if publishedStatus is incorrect', async () => {
        const questionsData = await request(httpServer)
            .get('/sa/quiz/questions?sortDirection=ASC&publishedStatus=incorrect')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(questionsData.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: questionsExpectData
        })
    })
})