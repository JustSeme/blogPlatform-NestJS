import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { initAppAndGetHttpServer } from '../test-utils';


describe('super-admin-users', () => {
    let httpServer;

    beforeAll(async () => {
        httpServer = await initAppAndGetHttpServer()

        await request(httpServer)
            .delete('/testing/all-data')
    });

})