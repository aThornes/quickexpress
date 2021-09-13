import ExpressWrapper from '..';
import express from 'express';
import { EndpointStruc } from '../src/types';

describe('Initialise quickExpress class', () => {
  it('Init', () => {
    const endpoint: EndpointStruc = {
      name: 'TestEndpoint',
      path: 'testendpoint',
      defaultPath: 'path',
      type: 'GET',
      headers: ['text'],
      execute(req: any, res: any, headers: any) {
        res.status(200).send(headers.text);
      },
    };

    const endpoints = [endpoint];

    const app = express();

    const expressWrapper = new ExpressWrapper({
      endpoints,
      expressApp: app,
    });

    const endpointList = endpoints.map((x) => x.name);

    expect(expressWrapper.getEndpointList()).toStrictEqual(endpointList);

    expect(expressWrapper.getEndpointData()).toBe(endpoints);
  });
});
