import { Request, Response } from 'express';
import { errorMessages } from './messages';
import { HandleRequestOpts, InitListenerOpts } from './types';
import { performValidation } from './validationHandler';

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

  const getRequestOpts = (req: Request, res: Response): HandleRequestOpts => {
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
