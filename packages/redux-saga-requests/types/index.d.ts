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
  | actionWithMultipleRequestAsPayload

export function sendRequest(action: action, dispatchRequestAction?: boolean): any;

export function watchRequests(): any;
