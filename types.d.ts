/* Interfaces */
interface LimiterStruc {
  points: number;
  duration: string;
  keyPrefix?: string;
}

interface LimiterConstructor {
  mongoClient?: Db;
  limiterOptions?: any;
}

interface EndpointStruc {
  name: string;
  disabled?: boolean;
  path: string;
  defaultPath?: string;
  limiter?: LimiterStruc;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: string[];
  body?: string[];
  execute(
    req: express.Request,
    res: express.Response,
    headers: express.Headers
  ): void;
}

interface ValidationRequest {
  headers: express.Headers;
  body?: express.body;
  endpointName?: string;
  endpointType?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

interface ValidationResponse {
  success: boolean;
  status?: number;
  error?: string;
  headers?: any;
}

interface WrapperStruc {
  endpoints: EndpointStruc[];
  expressApp: express.Application;
  limiter?: LimiterConstructor;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface HandleRequestOpts {
  req: express.Request;
  res: express.Response;
  endpoint: EndpointStruc;
  endpointLimiter?: EndpointLimiter;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface ValidateRequestOpts {
  req: express.Request;
  endpoint: EndpointStruc;
  endpointLimiter?: EndpointLimiter;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface InitListenerOpts {
  endpoint: EndpointStruc;
  endpointLimiter?: EndpointLimiter;
  expressApp: express.Application;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface InitRateLimiterOpts {
  limiterStore: any;
  limiter: LimiterConstructor;
  limiterOptions?: LimiterStruc;
  rateLimiterID: string;
}

interface CheckRateLimiterOpts {
  endpointLimiter: EndpointLimiter;
  identifier: string;
}

interface MongoLimiterOptions {
  limiterStore: any;
  mongoClient: Db;
  mongoOptions: any;
  limiterOptions: LimiterStruc;
  rateLimiterID: string;
}
