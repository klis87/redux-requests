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
  requestsCapacity?: number;
  normalize?: boolean;
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
  optimisticData?: any;
  revertedData?: any;
  localData?: any;
  cache?: boolean | number;
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
  (requestConfig: any, requestAction: RequestAction): Promise<any>;
}

interface HandleRequestConfig {
  driver: Driver | { default: Driver; [driverType: string]: Driver };
  onRequest?: (request: any, action: RequestAction) => any;
  onSuccess?: (response: any, action: RequestAction) => any;
  onError?: (error: any, action: RequestAction) => any;
  onAbort?: (action: RequestAction) => void;
  cache?: boolean;
  promisify?: boolean;
  autoPromisify?: boolean;
  ssr?: null | 'client' | 'server';
  isRequestAction?: (action: AnyAction) => boolean;
  isRequestActionQuery?: (requestAction: RequestAction) => boolean;
  takeLatest?: boolean | FilterActions;
  abortOn?: FilterActions | string | string[];
  normalize?: boolean;
  getNormalisationObjectKey?: (obj: any) => boolean;
  shouldObjectBeNormalized?: (obj: any) => boolean;
}

interface handleRequestsResponse {
  requestsReducer: Reducer;
  requestsMiddleware: Middleware[];
  requestsSagas: any[];
  requestsPromise: Promise<any> | null;
}

export function handleRequests(
  config: HandleRequestConfig,
): handleRequestsResponse;

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

export const clearRequestsCache: (
  ...actionTypes: string[]
) => { type: string; actionTypes: string[] };

export const resetRequests: (
  requests: (string | { requestType: string; requestKey: string })[],
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
};

export interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  loading: boolean;
}

export function getQuery<QueryStateData = any>(
  state: any,
  props: {
    type: string;
    requestKey?: string;
    multiple?: boolean;
    defaultData?: any;
  },
): QueryState<QueryStateData>;

export function getQuerySelector<QueryStateData = any>(props: {
  type: string;
  requestKey?: string;
  multiple?: boolean;
  defaultData?: any;
}): (
  state: any,
  props: {
    type: string;
    requestKey?: string;
    multiple?: boolean;
    defaultData?: any;
  },
) => QueryState<QueryStateData>;

export interface MutationState {
  loading: boolean;
  error: any;
}

export function getMutation(
  state: any,
  props: {
    type: string;
    requestKey?: string;
  },
): MutationState;

export function getMutationSelector(props: {
  type: string;
  requestKey?: string;
}): typeof getMutation;
