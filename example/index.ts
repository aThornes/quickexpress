import ExpressWrapper from '..';
import { MongoClient } from 'mongodb';
import express from 'express';
import fs from 'fs';

const endpointFolders = [
  { name: 'auth', defaultPath: 'auth' },
  { name: 'general' },
];

/* Read through specified folders and import contents */
const getEndpoints = () => {
  const endpoints: EndpointStruc[] = [];

  /* Iterate through each specified endpoint folder */
  endpointFolders.forEach((folder) => {
    const endpointFiles = fs
      .readdirSync(`/endpoints/${folder.name}`)
      .filter((file) => file.endsWith('.ts'));

    /* Iterate through each endpoint file and require the input */
    endpointFiles.forEach((file) => {
      endpoints.push(require(`/endpoints/${folder.name}/${file}`));

      /* Apply default folder to all endpoints in specified folder */
      endpoints[endpoints.length - 1].defaultPath = folder.defaultPath;
    });
  });

  return endpoints;
};

const startRestApi = async () => {
  /* Dynamically read each file in endpoints directory and load contents into array */
  const endpoints = getEndpoints();

  const client = await MongoClient.connect('mongodb://localhost:27017');

  const limiterDB = client.db('rateLimiterDB');

  const limiter: LimiterConstructor = { mongoClient: limiterDB };

  const app = express();

  const expressWrapper = new ExpressWrapper({
    endpoints,
    expressApp: app,
    limiter,
  });

  /* Start listener on all loaded endpoints */
  expressWrapper.initialise();
};

startRestApi();
