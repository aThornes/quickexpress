import express from 'express';

const execute = (req: express.Request, res: express.Response, headers: any) => {
  if (
    headers.username === 'testusername' &&
    headers.password === 'testpassword'
  ) {
    res.status(200).send({ text: "You've logged in!" });
  } else {
    res.status(401).send({ text: 'Incorrect credentials!' });
  }
};

const login = {
  name: 'Login',
  path: 'login',
  limiter: {
    points: 15,
    duration: '1h',
    keyPrefix: 'loginrx',
  },
  type: 'GET',
  headers: ['username', 'password'],
  execute,
};

export default login;
