import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { initAppAndGetHttpServer } from './test-utils';
import { funcSleep } from '../src/general/helpers/helpers';

describe('ip-restriction', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()
        await request(httpServer)
            .delete('/testing/all-data')
    });

    afterAll(async () => {
        //await app.close();
    });

    it('should send 5 requests to /auth/login, getting 401 error, then sixth requests, getting 429 error, then request after waiting 11 seconds, getting 401', async () => {
        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.UNAUTHORIZED)

        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.TOO_MANY_REQUESTS)

        await funcSleep(11000)

        await request(httpServer)
            .post('/auth/login')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should send 5 requests to /auth/registration, getting 400 error, then sixth requests, getting 429 error, then request after waiting 11 seconds, getting 400', async () => {
        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.TOO_MANY_REQUESTS)

        await funcSleep(11000)

        await request(httpServer)
            .post('/auth/registration')
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('should send 5 requests to /auth/registration-confirmation, getting 400 error, then sixth requests, getting 429 error, then request after waiting 11 seconds, getting 400', async () => {
        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.TOO_MANY_REQUESTS)

        await funcSleep(11000)

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('should send 5 requests to /auth/registration-email-resending, getting 400 error, then sixth requests, getting 429 error, then request after waiting 11 seconds, getting 400', async () => {
        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.TOO_MANY_REQUESTS)

        await funcSleep(11000)

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('should send 5 requests to /auth/password-recovery, getting 400 error, then sixth requests, getting 429 error, then request after waiting 11 seconds, getting 400', async () => {
        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.TOO_MANY_REQUESTS)

        await funcSleep(11000)

        await request(httpServer)
            .post('/auth/password-recovery')
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('should send 5 requests to /auth/password-recovery, getting 400 error, then sixth requests, getting 429 error, then request after waiting 11 seconds, getting 400', async () => {
        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.BAD_REQUEST)

        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.TOO_MANY_REQUESTS)

        await funcSleep(11000)

        await request(httpServer)
            .post('/auth/new-password')
            .expect(HttpStatus.BAD_REQUEST)
    })
});
