# QuickExpress (rest-express-wrapper)

[![npm](https://img.shields.io/npm/v/rest-express-wrapper?color=red)](https://www.npmjs.com/package/rest-express-wrapper)
[![npm bundle size](https://img.shields.io/bundlephobia/min/rest-express-wrapper)](https://www.npmjs.com/package/rest-express-wrapper)
[![npm downloads](https://img.shields.io/npm/dt/rest-express-wrapper?color=blue)](https://www.npmjs.com/package/rest-express-wrapper)

QuickExpress is an express wrapper created to initialise REST endpoints and validate all calls globally.

To utilise the rate limiting function, a mongo database object must provided. Support for alternatives will be added in due course (Redis, Memcache, mySQL & PostGres)

![Flow Diagram](https://github.com/aThornes/quickexpress/blob/master/docs/ClassFlow.png)

## Setup

### Creating endpoints

Without rate limiter

```ts
const endpoint: EndpointStruc = {
  name: 'TestEndpoint',
  path: 'testendpoint',
  defaultPath: 'path',
  type: 'GET',
  headers: ['text'],
  execute(
    req: express.Request,
    res: express.Response,
    headers: express.Headers
  ) {
    res.status(200).send(headers.text);
  },
};
```

With limiter:

```ts
const endpoint: EndpointStruc = {
  name: 'TestEndpoint',
  path: 'testendpoint',
  defaultPath: 'path',
  type: 'GET',
  headers: ['text'],
  limiter: {
    points: 10,
    duration: '1d', /* other examples: 500 (500 seconds), '1m' (60 seconds), '5m' (300 seconds), '10h' (36000 seconds), '1d' (86400 seconds) */
    keyPrefix: 'testlimiter' /* Name of table in database */
  }
  execute(
    req: express.Request,
    res: express.Response,
    headers: express.Headers
  ) {
    res.status(200).send(headers.text);
  },
};
```

### Creating the express wrapper object

Without rate limiter:

```js
const app = express();

const expressWrapper = new ExpressWrapper({
  endpoints,
  expressApp: app,
});
```

With rate limiter:

```js
const { MongoClient } = require('mongodb');

const mongoOpts = {
  useNewUrlParser: true,
};

const mongoConn = MongoClient.connect('mongodb://localhost:27017', mongoOpts);

const app = express();

const expressWrapper = new ExpressWrapper({
  endpoints,
  expressApp: app,
  mongoClient: mongoConn.db('rate_limiter_database_name'),
});
```

### Initialise endpoints

Before endpoints can be reached, you must initialise them via:

```js
expressWrapper.initialise();
```

## Using custom validation

### Validation request

You can pass a custom validation function that is applied when any endpoint is reached, this could include validating user logins/sessions or confirming the contents of specific headers.

The custom validation function accepts the following arguments as an object (typescript interface: 'ValidationRequest'):

```ts
{
  headers: express.Headers;
  endpointName?: string;
  endpointType?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}
```

And must return an object containing a boolean **success** key. Full response options:

```ts
{
  success: boolean;
  status?: number;
  error?: string;
  headers?: any;
}

```

**Example** of validation function utilising all possible return options.

Standard response:

```ts
const customValidator = ({
  headers,
  endpointName,
  endpointType,
}: ValidationRequest): Promise<ValidationResponse> => {
  if (headers.clientid === process.env.CLIENT_ID) {
    return { success: true, headers: { userID: resp.userid } };
  } else {
    return {
      success: false,
      status: 401,
      error: 'Invalid client id provided, unauthorised',
    };
  }
};
```

As a promise:

```ts
const customValidator = ({
  headers,
  endpointName,
  endpointType,
}: ValidationRequest): Promise<ValidationResponse> =>
  new Promise((resolve) => {
    // Here checkLogin is a promise function used to validate an active session key
    checkLogin(headers.sessionkey).then((resp) => {
      if (resp.success) {
        resolve({ success: true, headers: { userID: resp.userid } });
      } else {
        resolve({
          success: false,
          status: 401,
          error: 'Invalid session key provided, unauthorised',
        });
      }
    });
  });
```

### Limiter identifier

The identifier used in determining a request origin can be customised. By default, _req.ip_ is used from the express request object but this is not always sufficient.

To pass a custom identifier, you can define a function similar to below:

```ts
const getLimiterIdentifier = (req: express.Request): string => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};
```

## Constructor

To initialise the wrapper, the following must be passed

| Object Key               |                                                  Description                                                  | Required |
| :----------------------- | :-----------------------------------------------------------------------------------------------------------: | -------: |
| endpoints                |                                   Array of endpoints (see structure below)                                    |      [x] |
| mongoClient              |                                          Mongo database (DB object)                                           |          |
| expressApp               |                                      Express Application (new Express())                                      |      [x] |
| additionalLimiterOptions | Additional limiter options (see [options](https://github.com/animir/node-rate-limiter-flexible/wiki/Options)) |          |
| validateRequest          |                                  Custom function used for request validation                                  |          |
| getLimiterIdentifier     |                            Custom function used to set identifier used for limiter                            |          |

### Endpoint structure

Endpoints contain the following

| Object Key  |              Description              |               Example data | Required |
| :---------- | :-----------------------------------: | -------------------------: | -------: |
| name        |           Name of endpoint            |                      login |      [x] |
| disabled    |  Disable the endpoint (not callable)  |                       true |          |
| path        |               REST path               |                      login |      [x] |
| defaultPath |           REST path prefix            |                       auth |      [x] |
| limiter     |            Limiter object             |                       true |          |
| type        |             Request type              |                        GET |      [x] |
| headers     |           Required headers            |   ['username', 'password'] |          |
| execute     | Function executed on endpoint reached | execute(req,res,headers){} |      [x] |

### Limiter object

Note: In order to utilise the rate limiter, a mongo database object must be passed to the constructor

| Object Key |                Description                | Example data | Required |
| :--------- | :---------------------------------------: | -----------: | -------: |
| points     |    Hits allowed before limit enforced     |            5 |      [x] |
| duration   |       Time before points are reset        |         '2h' |      [x] |
| keyPrefix  | key used to identifer limiter in database |    'loginrx' |          |
