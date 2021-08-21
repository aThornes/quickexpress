import express from 'express';

const execute = (req: express.Request, res: express.Response) => {
  res.status(200).send({ text: "You've logged out!" });
};

const login = {
  name: 'Logout',
  path: 'logout',
  limiter: {
    points: 20,
    duration: '1d',
    keyPrefix: 'logoutrx',
  },
  type: 'GET',
  execute,
};

export default login;
