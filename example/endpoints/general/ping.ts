import express from 'express';

const execute = (req: express.Request, res: express.Response) => {
  res.status(200).send({ text: 'Pong!' });
};

const login = {
  name: 'Ping',
  path: 'ping',
  limiter: {
    points: 20,
    duration: '1m',
    keyPrefix: 'pingrx',
  },
  type: 'GET',
  execute,
};

export default login;
