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

interface OnRequest {
  (request: any): any;
}

interface OnSuccess {
  (response: any): any;
}

interface OnError {
  (error: any): any;
}

interface OnAbort {
  (): any;
}

interface RequestInstanceConfig {
  driver: Driver;
  success?: ActionTypeModifier;
  error?: ActionTypeModifier;
  abort?: ActionTypeModifier;
  onRequest?: OnRequest;
  onSuccess?: OnSuccess;
  onError?: OnError;
  onAbort?: OnAbort;
}

export function createRequestInstance(requestInstance: any, config: RequestInstanceConfig): any;

export function getRequestInstance(): any;

type ActionWithSingleRequest = {
  type: string;
  request: any;
}

type ActionWithMultipleRequests = {
  type: string;
  requests: any[];
}

type PayloadWithRequest = {
  request: any;
}

type PayloadWithRequests = {
  requests: any[];
}

type ActionWithSingleRequestAsPayload = {
  type: string;
  payload: PayloadWithRequest;
}

type ActionWithMultipleRequestAsPayload = {
  type: string;
  payload: PayloadWithRequests;
}

type Action =
  | ActionWithSingleRequest
  | ActionWithMultipleRequests
  | ActionWithSingleRequestAsPayload
  | ActionWithMultipleRequestAsPayload;

export function sendRequest(action: Action, dispatchRequestAction?: boolean): any;

export function watchRequests(): any;

interface GetData {
  (state: any, action: AnyAction): any;
}

interface OnActionCallback {
  (state: any, action: AnyAction, config: MergedReducerConfig): any;
}

type GlobalReducerConfig = {
  getSuccessSuffix?: ActionTypeModifier;
  getErrorSuffix?: ActionTypeModifier;
  getAbortSuffix?: ActionTypeModifier;
  dataKey?: string;
  errorKey?: string;
  pendingKey?: string;
  multiple?: boolean;
  getData?: GetData,
  onRequest?: OnActionCallback,
  onSuccess?: OnActionCallback,
  onError?: OnActionCallback,
  onAbort?: OnActionCallback,
};

type ActionTypeReducerConfig = {
  actionType: string;
};

type LocalReducerConfig = GlobalReducerConfig & ActionTypeReducerConfig;

type MergedReducerConfig = {
  actionType: string;
  getSuccessSuffix: ActionTypeModifier;
  getErrorSuffix: ActionTypeModifier;
  getAbortSuffix: ActionTypeModifier;
  dataKey: string;
  errorKey: string;
  pendingKey: string;
  multiple: boolean;
  getData: GetData,
  onRequest: OnActionCallback,
  onSuccess: OnActionCallback,
  onError: OnActionCallback,
  onAbort: OnActionCallback,
};

interface RequestsReducer {
  (localConfig: LocalReducerConfig, reducer?: Reducer<any>): Reducer<any>;
}

export const requestsReducer: RequestsReducer;

export function createRequestsReducer(globalConfig?: GlobalReducerConfig): RequestsReducer;
