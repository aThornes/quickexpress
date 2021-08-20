import ExpressWrapper from '..';
import express, { response } from 'express';
import request from 'supertest';

describe('Endpoint validation', () => {
  let app: Express.Application;

  const failStatus = 401;
  const successStatus = 200;

  const testClientID = '215385da-ba6b-45cb-971d-f112f6bbe006';

  const customValidator = ({
    headers,
  }: ValidationRequest): Promise<ValidationResponse> =>
    new Promise((resolve) => {
      if (headers.clientid === testClientID) resolve({ success: true });
      else
        resolve({
          success: false,
          error: 'Invalid client ID',
          status: failStatus,
        });
    });

  beforeAll(() => {
    const endpoint: EndpointStruc = {
      name: 'TestEndpoint',
      path: 'path/testendpoint',
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
      validateRequest: customValidator,
    });

    expressWrapper.initialise();
  });

  it('Request is denied if custom validator fails', async () => {
    const response = await request(app)
      .get('/path/testendpoint')
      .set({ text: 'Test text' });

    expect(response.status).toBe(failStatus);
  });

  it('Request returns 200 response if headers are passed', async () => {
    const response = await request(app)
      .get('/path/testendpoint')
      .set({ text: 'test text', clientid: testClientID });

    expect(response.status).toBe(successStatus);
  });
});
