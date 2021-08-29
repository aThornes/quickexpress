import express from 'express';
import http from 'http';
import ExpressWrapper from '../..';
import { MongoClient } from 'mongodb';
import { MongoDBHandler } from 'mongodb-if';
import { MongoClientOptions } from 'mongodb';

/*
 *   RATE LIMITER TEST
 * ---------------------------------
 * Integration test uses call to database therefore cannot be ran as standard unit test
 *
 * Attempts to initialise rate limiter on endpoint
 * Sets endpoint to a small amount of allowed requests every minute
 *
 * USER STEPS:
 *   Once initialised, user must access endpoint on localhost and confirm rate limit occurs after
 *      multiple attempts
 *
 */

const databaseName = 'expressWrapperLimiter';
const testPort = 8080;

const handlerOptions = {
  connectionDomain: 'mongodb://127.0.0.1:27017',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  dbNameList: [databaseName],
};

const dbHandler = new MongoDBHandler(handlerOptions);

const runTest = async () => {
  /* Await connection to database */
  await dbHandler.connect();

  const endpoint: EndpointStruc = {
    name: 'TestEndpoint',
    path: 'testendpoint',
    defaultPath: 'path',
    type: 'GET',
    limiter: {
      points: 2,
      duration: '1m',
      keyPrefix: 'testendpointrx',
    },
    execute(req: any, res: any, headers: any) {
      res.status(200).send({ text: 'You have not yet been rate limited!' });
    },
  };

  const limiter: LimiterConstructor = {
    mongoClient: dbHandler.getDatabaseObject(databaseName),
  };

  const endpoints = [endpoint];

  const app = express();

  const expressWrapper = new ExpressWrapper({
    endpoints,
    expressApp: app,
    limiter,
  });

  /* Await app listeners */
  await expressWrapper.initialise();

  const httpServer = http.createServer(app);

  httpServer.listen(testPort);

  httpServer.once('error', (e) => {
    throw Error(e.toString());
  });

  httpServer.once('listening', () => {
    /* Inform the console that the server is up and running */
    console.log(`[HTTP] Server running, listening on ${testPort}...`);
  });
};

runTest();
