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

const performValidation = ({
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
          error: errorMessages.BAD_IDENTIFIER,
        });
        return;
      }
    }

    /* If any headers are required for the endpoint, ensure they are present */
    if (endpoint.headers && endpoint.headers.length > 0) {
      const missingHeaders: string[] = [];
      const reqHeaders = Object.keys(req.headers);
      endpoint.headers.forEach((headerItem) => {
        if (!reqHeaders.includes(headerItem)) {
          missingHeaders.push(headerItem);
        }
      });

      if (missingHeaders.length > 0) {
        resolve({
          success: false,
          status: 401,
          error: `One or missing headers: ${missingHeaders.join(', ')}`,
        });
        return;
      }
    }

    /* Allow for custom validation methods */
    if (validateRequest) {
      const validationResult = await validateRequest({
        headers: req.headers,
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

const handleRequest = ({
  req,
  res,
  endpoint,
  endpointLimiter,
  validateRequest,
  getLimiterIdentifier,
}: HandleRequestOpts) => {
  performValidation({
    req,
    endpoint,
    endpointLimiter,
    validateRequest,
    getLimiterIdentifier,
  }).then((validationResult: any) => {
    if (validationResult.success) {
      endpoint.execute(req, res, {
        ...req.headers,
        ...validationResult.headers,
      });
    } else {
      res
        .status(validationResult.status || 500)
        .send({ text: validationResult.error || errorMessages.DEFAULT_ERROR });
    }
  });
};

export const runListener = ({
  expressApp,
  endpoint,
  endpointLimiter,
  validateRequest,
  getLimiterIdentifier,
}: InitListenerOpts) => {
  if (endpoint.disabled) return false;

  const getRequestOpts = (req: Request, res: Response) => {
    return {
      req,
      res,
      endpoint,
      endpointLimiter,
      validateRequest,
      getLimiterIdentifier,
    };
  };

  const listenerPath = endpoint.defaultPath
    ? `/${endpoint.defaultPath}/${endpoint.path}`
    : `/${endpoint.path}`;

  switch (endpoint.type.toUpperCase()) {
    case 'GET':
      expressApp.get(`${listenerPath}`, (req: Request, res: Response) =>
        handleRequest(getRequestOpts(req, res))
      );
      break;
    case 'POST':
      expressApp.post(`${listenerPath}`, (req: Request, res: Response) =>
        handleRequest(getRequestOpts(req, res))
      );
      break;
    case 'PUT':
      expressApp.get(`${listenerPath}`, (req: Request, res: Response) =>
        handleRequest(getRequestOpts(req, res))
      );
      break;
    case 'DELETE':
      expressApp.delete(`${listenerPath}`, (req: Request, res: Response) =>
        handleRequest(getRequestOpts(req, res))
      );
      break;
    default:
      throw new Error(
        `Invalid listener type found for ${endpoint.name}, '${endpoint.type}' is not valid`
      );
  }

  return true;
};
