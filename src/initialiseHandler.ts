import { runListener } from './listenerHandler';
import { getTimeFromString } from './utils';

import { RateLimiterMongo } from 'rate-limiter-flexible';

export const validateWrapperData = (data: WrapperStruc) => {
  if (!data.mongoClient) {
    data.endpoints.forEach((x) => {
      if (x.limiter) {
        /* Error thrown if limiter requested when mongo client was not provided */
        throw new Error(
          'Cannot initialise listener without a provided mongoClient'
        );
      }
    });
  }
};

export const initaliseRateLimiter = ({
  limiterStore,
  mongoClient,
  rateLimiter,
  additionalOptions,
  rateLimiterID,
}: InitRateLimiterOpts): RateLimiterMongo | null => {
  if (!rateLimiter) return null;

  const { points, duration, keyPrefix } = rateLimiter;

  /* Duration accepts m/h/d shorthand, multiply by the appropriate value */
  const valDuration = getTimeFromString(duration);

  if (limiterStore[rateLimiterID]) {
    throw new Error(
      `Duplicate keyprefix "${keyPrefix}" found, cannot create rate limiter`
    );
  }

  const rateLimiterOpts = {
    storeClient: mongoClient,
    points,
    duration: valDuration,
    keyPrefix,
    ...additionalOptions,
  };

  return new RateLimiterMongo(rateLimiterOpts);
};

export const initialiseEndpoints = (data: WrapperStruc) => {
  const {
    endpoints,
    mongoClient,
    expressApp,
    additionalLimiterOptions,
    validateRequest,
    getLimiterIdentifier,
  } = data;

  const limiterStore: any = {};
  const enabledList: string[] = [];

  endpoints.forEach((endpoint) => {
    const rateLimiterID = endpoint.limiter?.keyPrefix || `${endpoint.name}rx`;

    const endpointLimiter = initaliseRateLimiter({
      limiterStore,
      mongoClient: mongoClient,
      rateLimiter: endpoint.limiter,
      additionalOptions: additionalLimiterOptions,
      rateLimiterID,
    });

    if (endpointLimiter) limiterStore[rateLimiterID] = endpointLimiter;

    const enabled = runListener({
      expressApp: expressApp,
      endpoint,
      endpointLimiter,
      validateRequest,
      getLimiterIdentifier,
    });

    if (enabled) enabledList.push(endpoint.name);
  });

  return { limiterStore, enabledList };
};
