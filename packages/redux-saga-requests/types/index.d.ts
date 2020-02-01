import { AnyAction, Reducer, Middleware } from 'redux';

interface FilterActions {
  (action: AnyAction): boolean;
}

interface ModifyData {
  (data: any, mutationData: any): any;
}

interface RequestActionMeta {
  asPromise?: boolean;
  asMutation?: boolean;
  driver?: string;
  runByWatcher?: boolean;
  takeLatest?: boolean;
  abortOn?: FilterActions | string | string[];
  getData?: (data: any) => any;
  getError?: (error: any) => any;
  requestKey?: string;
  mutations?: {
    [actionType: string]:
      | ModifyData
      | {
          updateData?: ModifyData;
          updateDataOptimistic?: (data: any) => any;
          revertData?: (data: any) => any;
          local?: boolean;
        };
  };
  optimisticData: any;
  revertedData: any;
  cache?: boolean | number;
  cacheKey?: string;
  cacheSize?: number;
  dependentRequestsNumber?: number;
  isDependentRequest?: boolean;
  [extraProperty: string]: any;
}

export type RequestAction =
  | {
      type: string;
      request: any | any[];
      meta?: RequestActionMeta;
    }
  | {
      type: string;
      payload: {
        request: any | any[];
      };
      meta?: RequestActionMeta;
    };

type ActionTypeModifier = (actionType: string) => string;

export const success: ActionTypeModifier;

export const error: ActionTypeModifier;

export const abort: ActionTypeModifier;

export interface Driver {
  (requestConfig: any, requestAction: RequestAction): any;
}

interface RequestInstanceConfig {
  driver: Driver | { default: Driver; [driverType: string]: Driver };
  onRequest?: (request: any, action: RequestAction) => any;
  onSuccess?: (response: any, action: RequestAction) => any;
  onError?: (error: any, action: RequestAction) => any;
  onAbort?: (action: RequestAction) => void;
}

export const createRequestInstance: (config: RequestInstanceConfig) => any;

export const getRequestInstance: (driverType?: string) => any;

interface SendRequestConfig {
  dispatchRequestAction?: boolean;
  silent?: boolean;
  runOnRequest?: boolean;
  runOnSuccess?: boolean;
  runOnError?: boolean;
  runOnAbort?: boolean;
}

export const sendRequest: (
  action: RequestAction,
  config?: SendRequestConfig,
) => any;

interface WatchRequestsConfig {
  takeLatest?: boolean | FilterActions;
  abortOn?: FilterActions | string | string[];
}

export const watchRequests: (config?: WatchRequestsConfig) => void;

interface NetworkReducerConfig {
  isRequestActionQuery?: (requestAction: RequestAction) => boolean;
  getData?: (data: any) => any;
  getError?: (error: any) => any;
}

export const networkReducer: (config: NetworkReducerConfig) => Reducer<any>;

interface RequestsPromiseMiddlewareConfig {
  auto?: Boolean;
}

export const requestsPromiseMiddleware: (
  config?: RequestsPromiseMiddlewareConfig,
) => Middleware;

export const requestsCacheMiddleware: () => Middleware;

export const clearRequestsCache: (
  ...actionTypes: string[]
) => { type: string; actionTypes: string[] };

interface ServerRequestsFilterMiddlewareConfig {
  serverRequestActions: { type: string }[];
}

export const serverRequestsFilterMiddleware: (
  config: ServerRequestsFilterMiddlewareConfig,
) => Middleware;

interface ServerRequestActions {
  requestActionsToIgnore?: { type: string }[];
  successActions?: { type: string; [extraProperty: string]: any }[];
  dependentSuccessActions?: { type: string; [extraProperty: string]: any }[];
  errorActions?: { type: string; [extraProperty: string]: any }[];
}

interface CountServerRequestsConfig {
  serverRequestActions: ServerRequestActions;
  finishOnFirstError?: boolean;
}

export const countServerRequests: (config: CountServerRequestsConfig) => void;

export interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  loading: boolean;
}

export function getQuery<QueryStateData = any>(props: {
  type?: string;
  multiple?: boolean;
  defaultData?: any;
}): (state: any) => QueryState<QueryStateData>;

export interface MutationState {
  loading: boolean;
  error: any;
}

export function getMutation(props: {
  type: string;
  requestKey?: string;
}): (state: any) => MutationState;
