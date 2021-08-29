import { runListener } from './listenerHandler';

import { initaliseRateLimiter } from './limiterHander';

export const validateWrapperData = (data: WrapperStruc) => {
  if (!data.limiter) {
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

export const initialiseEndpoints = (data: WrapperStruc) => {
  const {
    endpoints,
    limiter,
    expressApp,
    validateRequest,
    getLimiterIdentifier,
  } = data;

  const limiterStore: any = {};
  const enabledList: string[] = [];

  endpoints.forEach((endpoint) => {
    const rateLimiterID = endpoint.limiter?.keyPrefix || `${endpoint.name}rx`;

    let endpointLimiter;
    if (limiter) {
      endpointLimiter = initaliseRateLimiter({
        limiterStore,
        limiter,
        limiterOptions: endpoint.limiter,
        rateLimiterID,
      });

      if (endpointLimiter) limiterStore[rateLimiterID] = endpointLimiter;
    }

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
