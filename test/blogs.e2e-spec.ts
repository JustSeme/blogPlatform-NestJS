import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { BlogInputModel } from '../src/blogs/api/models/BlogInputModel';
import { BlogViewModel } from '../src/blogs/application/dto/BlogViewModel';
import { createApp } from '../src/createApp'
import { PostInputModelWithoutBlogId } from '../src/blogs/api/models/PostInputModelWithoutBlogId';

describe('blogs', () => {
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

    const incorrectBlogInputModel: BlogInputModel = {
        name: '12',
        description: '12',
        websiteUrl: 'this is not a websiteUrl'
    }

    it('shouldn\'t create new blog with incorrect input data', async () => {
        const errorsMessagesData = await request(httpServer)
            .post(`/blogs`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectBlogInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        expect(errorsMessagesData.body.errorsMessages.length).toEqual(3)
        expect(errorsMessagesData.body.errorsMessages[0].field).toEqual('name')
        expect(errorsMessagesData.body.errorsMessages[1].field).toEqual('description')
        expect(errorsMessagesData.body.errorsMessages[2].field).toEqual('websiteUrl')

        await request(httpServer)
            .get(`/blogs`)
            .expect(HttpStatus.NOT_FOUND)

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

    it('should return 401 unauthorized if no basic auth is provided', async () => {
        const response = await request(httpServer)
            .post('/blogs')
            .send(correctBlogInputModel)
            .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body).toEqual({
            errorsMessages: 'Unauthorized'
        });
    });

    it('shouldn\'t update blog with incorrect input data', async () => {
        const errorsMessagesData = await request(httpServer)
            .put(`/blogs/${createdBlogId}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(incorrectBlogInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        const notUpdatedBlogData = await request(httpServer)
            .get(`/blogs/${createdBlogId}`)
            .expect(HttpStatus.OK)

        expect(notUpdatedBlogData.body.name).toEqual(correctBlogInputModel.name)
        expect(notUpdatedBlogData.body.description).toEqual(correctBlogInputModel.description)
        expect(notUpdatedBlogData.body.websiteUrl).toEqual(correctBlogInputModel.websiteUrl)

        expect(errorsMessagesData.body.errorsMessages.length).toEqual(3)
        expect(errorsMessagesData.body.errorsMessages[0].field).toEqual('name')
        expect(errorsMessagesData.body.errorsMessages[1].field).toEqual('description')
        expect(errorsMessagesData.body.errorsMessages[2].field).toEqual('websiteUrl')
    })

    const correctBlogBodyForUpdate = {
        name: 'was changed', // min 3 max 15
        description: 'description was changed', // min 3 max 500
        websiteUrl: 'www.changedUrl.com' // min 3 max 100 pattern ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
    }
    it('should update created blog', async () => {
        await request(httpServer)
            .put(`/blogs/${createdBlogId}`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(correctBlogBodyForUpdate)
            .expect(HttpStatus.NO_CONTENT)

        const blogData = await request(httpServer)
            .get(`/blogs/${createdBlogId}`)
            .expect(HttpStatus.OK)

        expect(blogData.body.name).toEqual(correctBlogBodyForUpdate.name)
        expect(blogData.body.description).toEqual(correctBlogBodyForUpdate.description)
        expect(blogData.body.websiteUrl).toEqual(correctBlogBodyForUpdate.websiteUrl)
    })

    const correctPostBody: PostInputModelWithoutBlogId = {
        title: 'correct title', // min: 3, max: 30 
        shortDescription: 'short desc', // min: 3, max: 100
        content: 'content' // min: 3, max: 1000
    }
    it('should create post for current blog', async () => {
        await request(httpServer)
            .post(`/blogs/${createdBlogId}/posts`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(correctPostBody)
            .expect(HttpStatus.CREATED)

        const postsForBlogData = await request(httpServer)
            .get(`/blogs/${createdBlogId}/posts`)
            .expect(HttpStatus.OK)

        expect(postsForBlogData.body.items.length).toEqual(1)
        expect(postsForBlogData.body.items[0].title).toEqual(correctPostBody.title)
        expect(postsForBlogData.body.items[0].shortDescription).toEqual(correctPostBody.shortDescription)
        expect(postsForBlogData.body.items[0].content).toEqual(correctPostBody.content)
    })
});
