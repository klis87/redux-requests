import { AnyAction, Reducer } from 'redux';

interface actionTypeModifier {
  (actionType: string): string;
}

export const success: actionTypeModifier;

export const error: actionTypeModifier;

export const abort: actionTypeModifier;

export function getActionWithSuffix(suffix: string): actionTypeModifier;

interface getSuccessPayload {
  (response: any, request: any): any;
}

interface getErrorPayload {
  (error: any): any;
}

interface sendRequest {
  (config: any): any;
}

interface abortRequest {
  (): void;
}

interface requestsHandlers {
  sendRequest: sendRequest;
  abortRequest?: abortRequest;
}

interface getRequestHandlers {
  (requestInstance: any, config?: any): requestsHandlers;
}

export interface driver {
  getSuccessPayload: getSuccessPayload;
  getErrorPayload: getErrorPayload;
  getRequestHandlers: getRequestHandlers;
}

interface onRequest {
  (request: any): any;
}

interface onSuccess {
  (response: any): any;
}

interface onError {
  (error: any): any;
}

interface onAbort {
  (): any;
}

interface requestInstanceConfig {
  driver: driver;
  success?: actionTypeModifier;
  error?: actionTypeModifier;
  abort?: actionTypeModifier;
  onRequest?: onRequest;
  onSuccess?: onSuccess;
  onError?: onError;
  onAbort?: onAbort;
}

export function createRequestInstance(requestInstance: any, config: requestInstanceConfig): any;

export function getRequestInstance(): any;

type actionWithSingleRequest = {
  type: string;
  request: any;
}

type actionWithMultipleRequests = {
  type: string;
  requests: any[];
}

type payloadWithRequest  = {
  request: any;
}

type payloadWithRequests  = {
  requests: any[];
}

type actionWithSingleRequestAsPayload = {
  type: string;
  payload: payloadWithRequest;
}

type actionWithMultipleRequestAsPayload = {
  type: string;
  payload: payloadWithRequests;
}

type action =
  | actionWithSingleRequest
  | actionWithMultipleRequests
  | actionWithSingleRequestAsPayload
  | actionWithMultipleRequestAsPayload;

export function sendRequest(action: action, dispatchRequestAction?: boolean): any;

export function watchRequests(): any;

interface getData {
  (state: any, action: AnyAction): any;
}

interface onActionCallback {
  (state: any, action: AnyAction, config: mergedReducerConfig): any;
}

type globalReducerConfig = {
  getSuccessSuffix?: actionTypeModifier;
  getErrorSuffix?: actionTypeModifier;
  getAbortSuffix?: actionTypeModifier;
  dataKey?: string;
  errorKey?: string;
  pendingKey?: string;
  multiple?: boolean;
  getData?: getData,
  onRequest?: onActionCallback,
  onSuccess?: onActionCallback,
  onError?: onActionCallback,
  onAbort?: onActionCallback,
};

type actionTypeReducerConfig = {
  actionType: string;
};

type localReducerConfig = globalReducerConfig & actionTypeReducerConfig;

type mergedReducerConfig = {
  actionType: string;
  getSuccessSuffix: actionTypeModifier;
  getErrorSuffix: actionTypeModifier;
  getAbortSuffix: actionTypeModifier;
  dataKey: string;
  errorKey: string;
  pendingKey: string;
  multiple: boolean;
  getData: getData,
  onRequest: onActionCallback,
  onSuccess: onActionCallback,
  onError: onActionCallback,
  onAbort: onActionCallback,
};

interface requestsReducerType {
  (localConfig: localReducerConfig, reducer?: Reducer<any>): Reducer<any>;
}

export const requestsReducer: requestsReducerType;

export function createRequestsReducer(globalConfig?: globalReducerConfig): requestsReducerType;
