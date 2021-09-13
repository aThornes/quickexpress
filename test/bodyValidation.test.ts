import ExpressWrapper from '..';
import express from 'express';
import request from 'supertest';
import { EndpointStruc } from '../src/types';

describe('Endpoint validation', () => {
  let app: express.Application;

  const successStatus = 200;

  beforeAll(() => {
    const endpoint: EndpointStruc = {
      name: 'TestEndpoint',
      path: 'testendpoint',
      defaultPath: 'path',
      type: 'POST',
      body: ['text'],
      execute(req: any, res: any, headers: any) {
        res.status(successStatus).send(headers.text);
      },
    };

    const endpoints = [endpoint];

    app = express();

    /* This is important, req.body will not be recognisable as a JSON object without this */
    app.use(express.json());

    const expressWrapper = new ExpressWrapper({
      endpoints,
      expressApp: app,
    });

    expressWrapper.initialise();
  });

  it('Request is denied if insufficient body arguments are passed', async () => {
    const response = await request(app)
      .post('/path/testendpoint')
      .set({ 'Content-Type': 'application/json' })
      .send({});

    expect(response.status).toBe(401);
  });

  it('Request returns 200 response if required body arguments are passed', async () => {
    const response = await request(app)
      .post('/path/testendpoint')
      .set({ 'Content-Type': 'application/json' })
      .send({ text: 'test text' });

    expect(response.status).toBe(successStatus);
  });
});
