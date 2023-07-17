import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { QuestionInputModel } from "../../src/SuperAdmin/api/models/quiz/QuestionInputModel";
import { initAppAndGetHttpServer } from "../test-utils";

describe('super-admin-quiz', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

    const questionInputModel1: QuestionInputModel = {
        body: 'What year today?', // min 10 max 500
        correctAnswers: ['2023', 'две тысячи двадцать третий', 'two thousand twenty-third'] // is string array
    }

    const questionInputModel2: QuestionInputModel = {
        body: 'How much 2 + 2', // min 10 max 500
        correctAnswers: ['4', 'четыре', 'four'] // is string array
    }

    const questionInputModel3: QuestionInputModel = {
        body: 'Where is Niger?', // min 10 max 500
        correctAnswers: ['Africa', 'Африка'] // is string array
    }

    const questionInputModel4: QuestionInputModel = {
        body: 'When salvery was abolishhed in Russia?', // min 10 max 500
        correctAnswers: ['2047', 'Никогда', 'Never'] // is string array
    }

    let questionId1, questionId2, questionId3, questionId4

    it('should create 4 questions', async () => {
        const createdQuestion1 = await request(httpServer)
            .post('/sa/questions')
            .set('Authorization', 'Basic incorrect')
            .send(questionInputModel1)
            .expect(HttpStatus.OK)

        questionId1 = createdQuestion1.body.id

        const createdQuestion2 = await request(httpServer)
            .post('/sa/questions')
            .set('Authorization', 'Basic incorrect')
            .send(questionInputModel2)
            .expect(HttpStatus.OK)

        questionId2 = createdQuestion2.body.id

        const createdQuestion3 = await request(httpServer)
            .post('/sa/questions')
            .set('Authorization', 'Basic incorrect')
            .send(questionInputModel3)
            .expect(HttpStatus.OK)

        questionId3 = createdQuestion3.body.id

        const createdQuestion4 = await request(httpServer)
            .post('/sa/questions')
            .set('Authorization', 'Basic incorrect')
            .send(questionInputModel4)
            .expect(HttpStatus.OK)

        questionId4 = createdQuestion4.body.id
    })
})