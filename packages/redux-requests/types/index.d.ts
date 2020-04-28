import { AnyAction, Reducer, Middleware, Store } from 'redux';

interface FilterActions {
  (action: AnyAction): boolean;
}

interface ModifyData {
  (data: any, mutationData: any): any;
}

interface RequestActionMeta {
  asMutation?: boolean;
  driver?: string;
  takeLatest?: boolean;
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
  silent?: boolean;
  onRequest?: (request: any, action: RequestAction, store: Store) => void;
  onSuccess?: (response: any, action: RequestAction, store: Store) => void;
  onError?: (error: any, action: RequestAction, store: Store) => void;
  onAbort?: (action: RequestAction, store: Store) => void;
  runOnRequest?: boolean;
  runOnSuccess?: boolean;
  runOnError?: boolean;
  runOnAbort?: boolean;
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
  onRequest?: (request: any, action: RequestAction, store: Store) => any;
  onSuccess?: (response: any, action: RequestAction, store: Store) => any;
  onError?: (error: any, action: RequestAction, store: Store) => any;
  onAbort?: (action: RequestAction, store: Store) => void;
  cache?: boolean;
  ssr?: null | 'client' | 'server';
  isRequestAction?: (action: AnyAction) => boolean;
  isRequestActionQuery?: (requestAction: RequestAction) => boolean;
  takeLatest?: boolean | FilterActions;
  normalize?: boolean;
  getNormalisationObjectKey?: (obj: any) => boolean;
  shouldObjectBeNormalized?: (obj: any) => boolean;
}

interface handleRequestsResponse {
  requestsReducer: Reducer;
  requestsMiddleware: Middleware[];
  requestsPromise: Promise<any> | null;
}

export function handleRequests(
  config: HandleRequestConfig,
): handleRequestsResponse;

export const clearRequestsCache: (
  ...actionTypes: string[]
) => { type: string; actionTypes: string[] };

export const resetRequests: (
  requests: (string | { requestType: string; requestKey: string })[],
  abortPending?: boolean,
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
  abortPending: boolean;
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
