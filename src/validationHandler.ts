import { errorMessages } from './messages';

const checkRateLimiter = ({
  endpointLimiter,
  identifier,
}: CheckRateLimiterOpts) => {
  return new Promise((resolve) => {
    endpointLimiter
      .consume(identifier)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

const checkArrayContains = (
  currentFields: string[],
  expectedFields: string[]
) => {
  const missingFields: string[] = [];

  expectedFields.forEach((requiredField: any) => {
    if (!currentFields.includes(requiredField)) {
      missingFields.push(requiredField);
    }
  });

  if (missingFields.length > 0) {
    return {
      success: false,
      missingFields,
    };
  }

  return {
    success: true,
  };
};

export const performValidation = ({
  req,
  endpoint,
  endpointLimiter,
  validateRequest,
  getLimiterIdentifier,
}: ValidateRequestOpts) =>
  new Promise(async (resolve) => {
    const { ip } = req;
    let identifier = ip;

    /* Allow for custom rate limit identifiers (e.g. get session key from header) */
    if (getLimiterIdentifier) identifier = getLimiterIdentifier(req);

    /* Incase custom function fails to get an identifier, fail all requests */
    if (!identifier) {
      resolve({ success: false, error: errorMessages.BAD_IDENTIFIER });
      return;
    }

    /* If a limiter is present, confirm requests are not exceeded for identifier */
    if (endpointLimiter) {
      const rateLimiterPass = await checkRateLimiter({
        endpointLimiter,
        identifier,
      });
      if (!rateLimiterPass) {
        resolve({
          success: false,
          status: 429,
          error: errorMessages.RATE_LIMIT_REACHED,
        });
        return;
      }
    }

    /* If any headers are required for the endpoint, ensure they are present */
    if (endpoint.headers && endpoint.headers.length > 0) {
      const headerValidation = checkArrayContains(
        Object.keys(req.headers),
        endpoint.headers
      );

      if (!headerValidation.success) {
        resolve({
          success: false,
          status: 401,
          error: `One or more headers are required : ${headerValidation.missingFields?.join(
            ''
          )}`,
        });
        return;
      }
    }

    /* If any fields are required in the body, ensure they are present */
    if (endpoint.body && endpoint.body.length > 0) {
      try {
        const bodyValidation = checkArrayContains(
          Object.keys(req.body),
          endpoint.body
        );

        if (!bodyValidation.success) {
          resolve({
            success: false,
            status: 401,
            error: `One or more arguments are required in the body : ${bodyValidation.missingFields?.join(
              ''
            )}`,
          });
          return;
        }
      } catch (e) {
        resolve({
          success: false,
          status: 400,
          error: 'Body must be in a valid JSON format',
        });
        return;
      }
    }

    /* Allow for custom validation methods */
    if (validateRequest) {
      const validationResult = await validateRequest({
        headers: req.headers,
        body: req.body,
        endpointName: endpoint.name,
        endpointType: endpoint.type,
      });

      if (validationResult.success === undefined) {
        throw new Error(
          'Custom validation request must return a promise containing a boolean success item (e.g. {success: true})'
        );
      }

      resolve(validationResult);
      return;
    }

    resolve({ success: true });
  });
