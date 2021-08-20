# QuickExpress (rest-express-wrapper)

[![npm](https://img.shields.io/npm/v/mongodb-if?color=red)](https://www.npmjs.com/package/rest-express-wrapper)
[![npm bundle size](https://img.shields.io/bundlephobia/min/mongodb-if)](https://www.npmjs.com/package/rest-express-wrapper)
[![npm downloads](https://img.shields.io/npm/dt/mongodb-if?color=blue)](https://www.npmjs.com/package/rest-express-wrapper)

QuickExpress is an express wrapper created to initialise REST endpoints and validate all calls globally.

To utilise the rate limiting function, a mongo database object must provided (details on how to do this will be added shortly). Support for alternatives will be added in due course (Redis, Memcache, mySQL & PostGres)

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
