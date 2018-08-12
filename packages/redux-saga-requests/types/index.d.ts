import { AnyAction, Reducer, Middleware } from 'redux';

type ActionTypeModifier = {
  (actionType: string): string;
};

export const success: ActionTypeModifier;

export const error: ActionTypeModifier;

export const abort: ActionTypeModifier;

export const getActionWithSuffix: (suffix: string) => ActionTypeModifier;

export type Driver = {
  requestInstance: any;
  getAbortSource: () => any;
  abortRequest: (abortSource: any) => void;
  sendRequest: (requestConfig: any, abortSource: any) => any;
  getSuccessPayload: (response: any, request: any) => any;
  getErrorPayload: (error: any) => any;
};

export type DriverCreator = (requestInstance: any, config?: any) => Driver;

type ActionWithRequest = {
  type: string;
  request: any | any[];
};

type ActionRequestPayload = {
  request: any | any[];
};

type ActionWithRequestAsPayload = {
  type: string;
  payload: ActionRequestPayload;
};

type RequestAction = ActionWithRequest | ActionWithRequestAsPayload;

type RequestInstanceConfig = {
  driver: Driver;
  success?: ActionTypeModifier;
  error?: ActionTypeModifier;
  abort?: ActionTypeModifier;
  successAction?: (action: RequestAction, data: any) => AnyAction;
  errorAction?: (action: RequestAction, error: any) => AnyAction;
  abortAction?: (action: RequestAction) => AnyAction;
  onRequest?: (request: any, action: RequestAction) => any;
  onSuccess?: (response: any, action: RequestAction) => any;
  onError?: (error: any, action: RequestAction) => any;
  onAbort?: (action: RequestAction) => void;
};

export const createRequestInstance: (config: RequestInstanceConfig) => any;

export const getRequestInstance: () => any;

type SendRequestConfig = {
  dispatchRequestAction?: boolean;
  silent?: boolean;
  runOnRequest?: boolean;
  runOnSuccess?: boolean;
  runOnError?: boolean;
  runOnAbort?: boolean;
};

export const sendRequest: (
  action: RequestAction,
  config?: SendRequestConfig,
) => any;

type FilterOnActionCallback = {
  (action: AnyAction): boolean;
};

type WatchRequestsConfig = {
  takeLatest?: boolean | FilterOnActionCallback;
  abortOn?: FilterOnActionCallback | string | string[];
  getLastActionKey?: (action: AnyAction) => string;
};

type WatchRequestsConfigPerRequestType = {
  [actionType: string]: WatchRequestsConfig;
};

export const watchRequests: (
  commonConfig?: WatchRequestsConfig,
  perRequestTypeConfig?: WatchRequestsConfigPerRequestType,
) => void;

type OnActionCallback = {
  (state: any, action: AnyAction, config: MergedReducerConfig): any;
};

type GlobalReducerConfig = {
  success?: ActionTypeModifier;
  error?: ActionTypeModifier;
  abort?: ActionTypeModifier;
  dataKey?: string;
  errorKey?: string;
  pendingKey?: string;
  multiple?: boolean;
  getData?: OnActionCallback;
  getError?: OnActionCallback;
  onRequest?: OnActionCallback;
  onSuccess?: OnActionCallback;
  onError?: OnActionCallback;
  onAbort?: OnActionCallback;
  resetOn?: FilterOnActionCallback | string[];
};

type ActionTypeReducerConfig = {
  actionType: string;
};

type LocalReducerConfig = GlobalReducerConfig & ActionTypeReducerConfig;

type MergedReducerConfig = {
  actionType: string;
  success: ActionTypeModifier;
  error: ActionTypeModifier;
  abort: ActionTypeModifier;
  dataKey: string;
  errorKey: string;
  pendingKey: string;
  multiple: boolean;
  getData: OnActionCallback;
  getError: OnActionCallback;
  onRequest: OnActionCallback;
  onSuccess: OnActionCallback;
  onError: OnActionCallback;
  onAbort: OnActionCallback;
  resetOn: FilterOnActionCallback | string[];
};

type RequestsReducer = {
  (localConfig: LocalReducerConfig, reducer?: Reducer<any>): Reducer<any>;
};

export const requestsReducer: RequestsReducer;

export const createRequestsReducer: (
  globalConfig?: GlobalReducerConfig,
) => RequestsReducer;

type requestsPromiseMiddlewareConfig = {
  success?: ActionTypeModifier;
  auto?: Boolean;
  getRequestAction?: (action: AnyAction) => any;
};

export const requestsPromiseMiddleware: (
  config?: requestsPromiseMiddlewareConfig,
) => Middleware;
