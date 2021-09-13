/* Interfaces */
export interface LimiterStruc {
  points: number;
  duration: string | number;
  keyPrefix?: string;
}

export interface LimiterConstructor {
  mongoClient?: import('mongodb').Db | null;
  limiterOptions?: any;
}

export type EndpointLimiter = any;

export interface EndpointStruc {
  name: string;
  disabled?: boolean;
  path: string;
  defaultPath?: string;
  limiter?: LimiterStruc;
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: string[];
  body?: string[];
  execute(
    req: import('express').Request,
    res: import('express').Response,
    headers: any
  ): void;
}

export interface ValidationRequest {
  headers: any;
  body?: any;
  endpointName?: string;
  endpointType?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface ValidationResponse {
  success: boolean;
  status?: number;
  error?: string;
  headers?: any;
}

export interface WrapperStruc {
  endpoints: EndpointStruc[];
  expressApp: import('express').Application;
  limiter?: LimiterConstructor;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: import('express').Request): string;
}

export interface HandleRequestOpts {
  req: import('express').Request;
  res: import('express').Response;
  endpoint: EndpointStruc;
  endpointLimiter?: EndpointLimiter;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: import('express').Request): string;
}

export interface ValidateRequestOpts {
  req: import('express').Request;
  endpoint: EndpointStruc;
  endpointLimiter?: EndpointLimiter;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: import('express').Request): string;
}

export interface InitListenerOpts {
  endpoint: EndpointStruc;
  endpointLimiter?: EndpointLimiter;
  expressApp: import('express').Application;
  validateRequest?(
    request: ValidationRequest
  ): Promise<ValidationResponse> | ValidationResponse;
  getLimiterIdentifier?(req: import('express').Request): string;
}

export interface InitRateLimiterOpts {
  limiterStore: any;
  limiter: LimiterConstructor;
  limiterOptions?: LimiterStruc;
  rateLimiterID: string;
}

export interface CheckRateLimiterOpts {
  endpointLimiter: EndpointLimiter;
  identifier: string;
}

export interface MongoLimiterOptions {
  limiterStore: any;
  mongoClient: import('mongodb').Db;
  mongoOptions: any;
  limiterOptions: LimiterStruc;
  rateLimiterID: string;
}
