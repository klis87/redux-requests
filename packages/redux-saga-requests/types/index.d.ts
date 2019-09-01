import { AnyAction, Reducer, Middleware } from 'redux';

interface FilterOnActionCallback {
  (action: AnyAction): boolean;
}

interface OnActionCallback {
  (state: any, action: AnyAction, config: MergedReducerConfig): any;
}

interface RequestActionMeta {
  asPromise?: boolean;
  asMutation?: boolean;
  driver?: string;
  runByWatcher?: boolean;
  takeLatest?: boolean;
  abortOn?: FilterOnActionCallback | string | string[];
  resetOn?: FilterOnActionCallback | string[];
  getData?: OnActionCallback;
  updateData?: OnActionCallback;
  getError?: OnActionCallback;
  operations?: {
    getRequestKey?: (action: RequestAction) => string;
    [actionType: string]:
      | boolean
      | OnActionCallback
      | {
          updateData: boolean | OnActionCallback;
        }
      | {
          updateData?: OnActionCallback;
          updateDataOptimistic: OnActionCallback;
          revertData: OnActionCallback;
        }
      | {
          updateData: OnActionCallback;
          local: true;
        };
  };
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
  requestInstance: any;
  getAbortSource: () => any;
  abortRequest: (abortSource: any) => void;
  sendRequest: (
    requestConfig: any,
    abortSource: any,
    requestAction: RequestAction,
  ) => any;
  getSuccessPayload: (response: any, request: any) => any;
  getErrorPayload: (error: any) => any;
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
  takeLatest?: boolean | FilterOnActionCallback;
  abortOn?: FilterOnActionCallback | string | string[];
  getLastActionKey?: (action: AnyAction) => string;
}

export const watchRequests: (config?: WatchRequestsConfig) => void;

interface Mutations {
  [actionType: string]:
    | boolean
    | OnActionCallback
    | {
        updateData: boolean | OnActionCallback;
        getRequestKey?: (action: RequestAction) => string;
      }
    | {
        updateData?: OnActionCallback;
        updateDataOptimistic: OnActionCallback;
        revertData: OnActionCallback;
        getRequestKey?: (action: RequestAction) => string;
      }
    | {
        updateData: OnActionCallback;
        local: true;
      };
}

interface CommonReducerConfig {
  getData?: OnActionCallback;
  updateData?: OnActionCallback;
  getError?: OnActionCallback;
  onRequest?: OnActionCallback;
  onSuccess?: OnActionCallback;
  onError?: OnActionCallback;
  onAbort?: OnActionCallback;
  resetOn?: FilterOnActionCallback | string[];
}

interface RequestsReducerConfig extends CommonReducerConfig {
  actionType: string;
  multiple?: boolean;
  getDefaultData?: (multiple: boolean) => any;
  mutations?: Mutations;
  handleMutationsState?: boolean;
}

interface MergedReducerConfig {
  actionType: string;
  multiple: boolean;
  getDefaultData: (multiple: boolean) => any;
  getData: OnActionCallback;
  updateData: OnActionCallback;
  getError: OnActionCallback;
  onRequest: OnActionCallback;
  onSuccess: OnActionCallback;
  onError: OnActionCallback;
  onAbort: OnActionCallback;
  resetOn: FilterOnActionCallback | string[];
  mutations: Mutations;
  handleMutationsState: boolean;
}

interface RequestsReducer {
  (config: RequestsReducerConfig): Reducer<any>;
}

export const requestsReducer: RequestsReducer;

interface NetworkReducerConfig extends CommonReducerConfig {
  isRequestActionQuery?: (requestAction: RequestAction) => boolean;
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

interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  loading: boolean;
}

type RequestSelector<QueryStateData> = (
  state: any,
) => Omit<QueryState<QueryStateData>, 'loading'> & { pending: number };

export function getQuery<QueryStateData = any>(props: {
  type?: string;
  requestSelector?: RequestSelector<QueryStateData>;
  multiple?: boolean;
  defaultData?: any;
}): (state: any) => QueryState<QueryStateData>;

interface MutationState {
  loading: boolean;
  error: any;
}

export function getMutation(props: {
  type: string;
  requestKey?: string;
  requestSelector?: RequestSelector<any>;
}): (state: any) => MutationState;
