import ExpressWrapper from '..';
import express from 'express';
import request from 'supertest';

describe('Endpoint validation', () => {
  let app: Express.Application;

  const successStatus = 200;

  beforeAll(() => {
    const endpoint: EndpointStruc = {
      name: 'TestEndpoint',
      path: 'testendpoint',
      defaultPath: 'path',
      type: 'GET',
      headers: ['text'],
      execute(req: any, res: any, headers: any) {
        res.status(successStatus).send(headers.text);
      },
    };

    const endpoints = [endpoint];

    app = express();

    const expressWrapper = new ExpressWrapper({
      endpoints,
      expressApp: app,
    });

    expressWrapper.initialise();
  });

  it('Request is denied if insufficient headers are passed', async () => {
    const response = await request(app).get('/path/testendpoint').set({});

    expect(response.status).toBe(401);
  });

  it('Request returns 200 response if headers are passed', async () => {
    const response = await request(app)
      .get('/path/testendpoint')
      .set({ text: 'test text' });

    expect(response.status).toBe(successStatus);
  });
});
