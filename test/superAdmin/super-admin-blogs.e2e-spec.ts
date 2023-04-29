import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/createApp';
import { UserInputModel } from '../../src/auth/api/models/UserInputModel';
import { BlogInputModel } from '../../src/blogs/api/models/BlogInputModel';
import { BlogViewModel } from '../../src/blogs/application/dto/BlogViewModel';

describe('super-admin-blogs', () => {
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

    let userId
    let userLogin

    const createUserInputData: UserInputModel = {
        login: 'login',
        password: 'password',
        email: 'email@email.ru'
    }

    it('should create user and should login, getting userId, userLogin', async () => {
        const createdUserData = await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData)
            .expect(HttpStatus.CREATED)

        await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData.login,
                password: createUserInputData.password
            })
            .expect(HttpStatus.OK)
        userId = createdUserData.body.id
        userLogin = createdUserData.body.login
    })

    const anotherCreateUserInputData: UserInputModel = {
        login: 'login2',
        password: 'password',
        email: 'emai2l@email.ru'
    }

    let anotherUserId
    it('should create another user and should login, getting anotherUserId', async () => {
        const createdUserData = await request(httpServer)
            .post(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(anotherCreateUserInputData)
            .expect(HttpStatus.CREATED)

        await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData.login,
                password: createUserInputData.password
            })
            .expect(HttpStatus.OK)
        anotherUserId = createdUserData.body.id
    })

    const correctBlogInputModel: BlogInputModel = {
        name: 'Test Blog name',
        description: 'Test Blog description',
        websiteUrl: 'www.url.com',
    };

    let createdBlogId: string

    it('should create a new blog', async () => {
        const response = await request(httpServer)
            .post('/blogs')
            .send(correctBlogInputModel)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.CREATED);

        const blogViewModel: BlogViewModel = response.body;
        expect(blogViewModel.name).toEqual(correctBlogInputModel.name);
        expect(blogViewModel.description).toEqual(correctBlogInputModel.description);
        expect(blogViewModel.websiteUrl).toEqual(correctBlogInputModel.websiteUrl);
        expect(blogViewModel.id).toBeDefined();

        createdBlogId = blogViewModel.id
    });

    it('should return 401 error if basic auth is incorrect', async () => {
        await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic incorrect')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should return early created blog with blogOwnerInfo', async () => {
        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].name).toEqual(correctBlogInputModel.name)
        expect(blogsData.body.items[0].description).toEqual(correctBlogInputModel.description)
        expect(blogsData.body.items[0].websiteUrl).toEqual(correctBlogInputModel.websiteUrl)
        expect(blogsData.body.items[0].blogOwnerInfo.userId).toEqual('superAdmin')
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual('superAdmin')
    })

    it('shouldn\'t bind early created blog with early created user if basic auth is absent', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/bind-with-user/${userId}`)
            .expect(HttpStatus.UNAUTHORIZED)

        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toEqual('superAdmin')
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual('superAdmin')
    })

    it('shouldn\'t bind early created blog with early created user if entity by userId or blogId is not exists', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/bind-with-user/userId`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.BAD_REQUEST)

        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toEqual('superAdmin')
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual('superAdmin')
    })

    it('should bind early created blog with early created user', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/bind-with-user/${userId}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.NO_CONTENT)

        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toEqual(userId)
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual(userLogin)
    })

    it('shouldn\'t bind early created blog with early created user if blod already bound to any user', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/bind-with-user/${anotherUserId}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.BAD_REQUEST)

        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toEqual(userId)
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual(userLogin)
    })
});
