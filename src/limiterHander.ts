import { RateLimiterMongo } from 'rate-limiter-flexible';
import { InitRateLimiterOpts, MongoLimiterOptions } from './types';
import { getTimeFromString } from './utils';

export const initaliseRateLimiter = ({
  limiterStore,
  limiter,
  limiterOptions,
  rateLimiterID,
}: InitRateLimiterOpts): any => {
  if (!limiterOptions) return null;

  if (limiter.mongoClient) {
    return initialiseMongoLimiter({
      limiterStore,
      mongoClient: limiter.mongoClient,
      mongoOptions: limiter.limiterOptions,
      limiterOptions,
      rateLimiterID,
    });
  }

  throw new Error(
    `Limiter failed to be created for "${limiterOptions.keyPrefix}", no valid limiter found (mongo currently only valid option)`
  );
};

const initialiseMongoLimiter = ({
  limiterStore,
  mongoClient,
  mongoOptions,
  limiterOptions,
  rateLimiterID,
}: MongoLimiterOptions) => {
  const { points, duration, keyPrefix } = limiterOptions;

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
    ...mongoOptions,
  };

  return new RateLimiterMongo(rateLimiterOpts);
};
