import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { AppModule } from '../../src/app.module';
import { createApp } from '../../src/createApp';
import { UserInputModel } from '../../src/SuperAdmin/api/models/UserInputModel';
import { BlogInputModel } from '../../src/blogs/api/models/BlogInputModel';
import { BlogViewModel } from '../../src/blogs/application/dto/BlogViewModel';
import { PostInputModelWithoutBlogId } from '../../src/blogs/api/models/PostInputModelWithoutBlogId';

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

    let firstAccessToken
    it('should create user and should login, getting userId, userLogin', async () => {
        const createdUserData = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(createUserInputData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData.login,
                password: createUserInputData.password
            })
            .expect(HttpStatus.OK)

        firstAccessToken = accessTokenResponseData.body.accessToken
        userId = createdUserData.body.id
        userLogin = createdUserData.body.login
    })

    const anotherCreateUserInputData: UserInputModel = {
        login: 'login2',
        password: 'password',
        email: 'emai2l@email.ru'
    }

    let accessToken
    let anotherUserId
    it('should create another user and should login, getting anotherUserId', async () => {
        const createdUserData = await request(httpServer)
            .post(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(anotherCreateUserInputData)
            .expect(HttpStatus.CREATED)

        const accessTokenResponseData = await request(httpServer)
            .post(`/auth/login`)
            .send({
                loginOrEmail: createUserInputData.login,
                password: createUserInputData.password
            })
            .expect(HttpStatus.OK)

        accessToken = accessTokenResponseData.body.accessToken
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
            .post('/blogger/blogs')
            .send(correctBlogInputModel)
            .set('Authorization', `Bearer ${firstAccessToken}`)
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
        expect(blogsData.body.items[0].blogOwnerInfo.userId).toBeDefined()
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual(createUserInputData.login)
    })

    it('shouldn\'t bind early created blog with early created user if basic auth is absent', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/bind-with-user/${userId}`)
            .expect(HttpStatus.UNAUTHORIZED)

        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toBeDefined()
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual(createUserInputData.login)
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

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toBeDefined()
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual(createUserInputData.login)
    })

    it('shouldn\'t bind early created blog with early created user if blod already bound to any user', async () => {
        const errorResponseData = await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/bind-with-user/${anotherUserId}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorResponseData.body.errorsMessages[0].message).toEqual('blog is already bounded with any user')

        const blogsData = await request(httpServer)
            .get('/sa/blogs')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(blogsData.body.items[0].blogOwnerInfo.userId).toEqual(userId)
        expect(blogsData.body.items[0].blogOwnerInfo.userLogin).toEqual(userLogin)
    })

    const correctPostInputModel: PostInputModelWithoutBlogId = {
        title: 'correct title', // min 3 max 30
        shortDescription: 'short desc', // min 3 max 100
        content: 'this is a content' // min 3 max 1000
    }

    let createdPostId
    it('should create post for early created blog', async () => {
        const createdPostResponseData = await request(httpServer)
            .post(`/blogger/blogs/${createdBlogId}/posts`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(correctPostInputModel)
            .expect(HttpStatus.CREATED)

        createdPostId = createdPostResponseData.body.id

        const postData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(postData.body.title).toEqual(correctPostInputModel.title)
        expect(postData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postData.body.content).toEqual(correctPostInputModel.content)
    })

    it(`admin shouldn't ban blog if basic auth is incorrect and created post for this blog should display`, async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/ban`)
            .set('Authorization', 'Basic incorrect')
            .send({
                isBanned: true
            })
            .expect(HttpStatus.UNAUTHORIZED)

        const postData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(postData.body.title).toEqual(correctPostInputModel.title)
        expect(postData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postData.body.content).toEqual(correctPostInputModel.content)
    })

    it(`admin shouldn't ban blog if BanUserInputModel has incorrect values and created post for this blog should display`, async () => {
        await request(httpServer)
            .put(`/sa/blogs/incorrect/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                isBanned: true
            })
            .expect(HttpStatus.BAD_REQUEST)

        const postData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(postData.body.title).toEqual(correctPostInputModel.title)
        expect(postData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postData.body.content).toEqual(correctPostInputModel.content)
    })

    it(`admin shouldn't ban blog if BanUserInputModel has incorrect values and created post for this blog should display`, async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                isBanned: 'true'
            })
            .expect(HttpStatus.BAD_REQUEST)

        const postData = await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)

        expect(postData.body.title).toEqual(correctPostInputModel.title)
        expect(postData.body.shortDescription).toEqual(correctPostInputModel.shortDescription)
        expect(postData.body.content).toEqual(correctPostInputModel.content)
    })

    it('admin should ban blog and created post for this blog shouldn\'t display', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                isBanned: true
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.NOT_FOUND)
    })

    it('admin should unban blog and created post for this blog should display', async () => {
        await request(httpServer)
            .put(`/sa/blogs/${createdBlogId}/ban`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send({
                isBanned: false
            })
            .expect(HttpStatus.NO_CONTENT)

        await request(httpServer)
            .get(`/posts/${createdPostId}`)
            .expect(HttpStatus.OK)
    })
});
