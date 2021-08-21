interface LimiterStruc {
  points: number;
  duration: string;
  keyPrefix?: string;
}

interface EndpointStruc {
  name: string;
  disabled?: boolean;
  path: string;
  defaultPath?: string;
  limiter?: LimiterStruc;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: string[];
  execute(
    req: express.Request,
    res: express.Response,
    headers: express.Headers
  ): void;
}

interface ValidationRequest {
  headers: express.Headers;
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
  mongoClient?: Db;
  expressApp: express.Application;
  additionalLimiterOptions?: IRateLimiterMongoOptions;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface HandleRequestOpts {
  req: express.Request;
  res: express.Response;
  endpoint: EndpointStruc;
  endpointLimiter?: RateLimiterMongo;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface ValidateRequestOpts {
  req: express.Request;
  endpoint: EndpointStruc;
  endpointLimiter?: RateLimiterMongo;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface InitListenerOpts {
  endpoint: EndpointStruc;
  endpointLimiter?: RateLimiterMongo;
  expressApp: express.Application;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: express.Request): string;
}

interface InitRateLimiterOpts {
  limiterStore: any;
  mongoClient: Db;
  rateLimiter?: LimiterStruc;
  rateLimiterID: string;
  additionalOptions?: IRateLimiterMongoOptions;
}

interface CheckRateLimiterOpts {
  endpointLimiter: RateLimiterMongo;
  identifier: string;
}
