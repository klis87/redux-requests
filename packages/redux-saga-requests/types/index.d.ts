import { AnyAction, Reducer } from 'redux';

interface ActionTypeModifier {
  (actionType: string): string;
}

export const success: ActionTypeModifier;

export const error: ActionTypeModifier;

export const abort: ActionTypeModifier;

export function getActionWithSuffix(suffix: string): ActionTypeModifier;

interface GetSuccessPayload {
  (response: any, request: any): any;
}

interface GetErrorPayload {
  (error: any): any;
}

interface SendRequest {
  (config: any): any;
}

interface AbortRequest {
  (): void;
}

interface RequestsHandlers {
  sendRequest: SendRequest;
  abortRequest?: AbortRequest;
}

interface GetRequestHandlers {
  (requestInstance: any, config?: any): RequestsHandlers;
}

export interface Driver {
  getSuccessPayload: GetSuccessPayload;
  getErrorPayload: GetErrorPayload;
  getRequestHandlers: GetRequestHandlers;
}

type ActionWithSingleRequest = {
  type: string;
  request: any;
};

type ActionWithMultipleRequests = {
  type: string;
  requests: any[];
};

type PayloadWithRequest = {
  request: any;
};

type PayloadWithRequests = {
  requests: any[];
};

type ActionWithSingleRequestAsPayload = {
  type: string;
  payload: PayloadWithRequest;
};

type ActionWithMultipleRequestAsPayload = {
  type: string;
  payload: PayloadWithRequests;
};

type RequestAction =
  | ActionWithSingleRequest
  | ActionWithMultipleRequests
  | ActionWithSingleRequestAsPayload
  | ActionWithMultipleRequestAsPayload;

interface SuccessAction {
  (action: RequestAction, data: any): AnyAction;
}

interface ErrorAction {
  (action: RequestAction, error: any): AnyAction;
}

interface AbortAction {
  (action: RequestAction): AnyAction;
}

interface OnRequest {
  (request: any, action: RequestAction): any;
}

interface OnSuccess {
  (response: any, action: RequestAction): any;
}

interface OnError {
  (error: any, action: RequestAction): any;
}

interface OnAbort {
  (action: RequestAction): void;
}

interface RequestInstanceConfig {
  driver: Driver;
  success?: ActionTypeModifier;
  error?: ActionTypeModifier;
  abort?: ActionTypeModifier;
  successAction?: SuccessAction;
  errorAction?: ErrorAction;
  abortAction?: AbortAction;
  onRequest?: OnRequest;
  onSuccess?: OnSuccess;
  onError?: OnError;
  onAbort?: OnAbort;
}

export function createRequestInstance(
  requestInstance: any,
  config: RequestInstanceConfig,
): any;

export function getRequestInstance(): any;

type SendRequestConfig = {
  dispatchRequestAction?: boolean;
  silent?: boolean;
  runOnRequest?: boolean;
  runOnSuccess?: boolean;
  runOnError?: boolean;
  runOnAbort?: boolean;
};

export function sendRequest(
  action: RequestAction,
  config?: SendRequestConfig,
): any;

interface FilterOnActionCallback {
  (action: AnyAction): boolean;
}

type WatchRequestsConfig = {
  takeLatest?: boolean;
  abortOn?: FilterOnActionCallback | string | string[];
  getLastActionKey?: (action: AnyAction) => string;
};

type WatchRequestsConfigPerRequestType = {
  [actionType: string]: WatchRequestsConfig;
};

export function watchRequests(
  commonConfig?: WatchRequestsConfig,
  perRequestTypeConfig?: WatchRequestsConfigPerRequestType,
): void;

interface OnActionCallback {
  (state: any, action: AnyAction, config: MergedReducerConfig): any;
}

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

interface RequestsReducer {
  (localConfig: LocalReducerConfig, reducer?: Reducer<any>): Reducer<any>;
}

export const requestsReducer: RequestsReducer;

export function createRequestsReducer(
  globalConfig?: GlobalReducerConfig,
): RequestsReducer;
