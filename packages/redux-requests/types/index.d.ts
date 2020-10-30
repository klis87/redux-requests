import { AnyAction, Reducer, Middleware, Store } from 'redux';

export function dispatchRequest<QueryStateData = any>(
  requestAction: RequestAction<any, QueryStateData>,
): Promise<{
  data?: QueryStateData;
  error?: null;
  isAborted?: true;
  action: any;
}>;

interface FilterActions {
  (action: AnyAction): boolean;
}

interface ModifyData {
  (data: any, mutationData: any): any;
}

interface RequestsStore extends Store {
  dispatchRequest: typeof dispatchRequest;
}

export const createRequestStore: (store: Store) => RequestsStore;

interface RequestActionMeta<Data, TransformedData> {
  asMutation?: boolean;
  driver?: string;
  takeLatest?: boolean;
  getData?: (data: Data, currentData: TransformedData) => TransformedData;
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
  cacheKey?: string;
  dependentRequestsNumber?: number;
  isDependentRequest?: boolean;
  silent?: boolean;
  onRequest?: (
    request: any,
    action: RequestAction,
    store: RequestsStore,
  ) => any;
  onSuccess?: (
    response: any,
    action: RequestAction,
    store: RequestsStore,
  ) => any;
  onError?: (error: any, action: RequestAction, store: RequestsStore) => any;
  onAbort?: (action: RequestAction, store: RequestsStore) => void;
  runOnRequest?: boolean;
  runOnSuccess?: boolean;
  runOnError?: boolean;
  runOnAbort?: boolean;
  [extraProperty: string]: any;
}

export type RequestAction<Data = any, TransformedData = Data> =
  | {
      type?: string;
      request: any | any[];
      meta?: RequestActionMeta<Data, TransformedData>;
    }
  | {
      type?: string;
      payload: {
        request: any | any[];
      };
      meta?: RequestActionMeta<Data, TransformedData>;
    };

export type LocalMutationAction = {
  type?: string;
  meta: {
    mutations?: {
      [actionType: string]: {
        updateData: ModifyData;
        local: true;
      };
    };
    localData?: any;
    [extraProperty: string]: any;
  };
};

type ResponseData<
  Request extends (...args: any[]) => RequestAction
> = ReturnType<ReturnType<Request>['meta']['getData']>;

type ActionTypeModifier = (actionType: string) => string;

export const success: ActionTypeModifier;

export const error: ActionTypeModifier;

export const abort: ActionTypeModifier;

export interface Driver {
  (requestConfig: any, requestAction: RequestAction): Promise<any>;
}

interface HandleRequestConfig {
  driver: Driver | { default: Driver; [driverType: string]: Driver };
  onRequest?: (
    request: any,
    action: RequestAction,
    store: RequestsStore,
  ) => any;
  onSuccess?: (
    response: any,
    action: RequestAction,
    store: RequestsStore,
  ) => any;
  onError?: (error: any, action: RequestAction, store: RequestsStore) => any;
  onAbort?: (action: RequestAction, store: RequestsStore) => void;
  cache?: boolean;
  ssr?: null | 'client' | 'server';
  isRequestAction?: (action: AnyAction) => boolean;
  isRequestActionQuery?: (requestAction: RequestAction) => boolean;
  takeLatest?: boolean | FilterActions;
  normalize?: boolean;
  getNormalisationObjectKey?: (obj: any) => string;
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
  requests?: (string | { requestType: string; requestKey: string })[],
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
};

export const resetRequests: (
  requests?: (string | { requestType: string; requestKey: string })[],
  abortPending?: boolean,
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
  abortPending: boolean;
};

export const abortRequests: (
  requests?: (string | { requestType: string; requestKey: string })[],
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
};

export interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  loading: boolean;
  pristine: boolean;
}

export function getQuery<QueryStateData = any>(
  state: any,
  props: {
    type: string | ((...params: any[]) => RequestAction<any, QueryStateData>);
    action?: (...params: any[]) => RequestAction<any, QueryStateData>;
    requestKey?: string;
    multiple?: boolean;
    defaultData?: any;
  },
): QueryState<QueryStateData>;

export function getQuerySelector<QueryStateData = any>(props: {
  type: string | ((...params: any[]) => RequestAction<any, QueryStateData>);
  action?: (...params: any[]) => RequestAction<any, QueryStateData>;
  requestKey?: string;
  multiple?: boolean;
  defaultData?: any;
}): (state: any) => QueryState<QueryStateData>;

export interface MutationState {
  loading: boolean;
  error: any;
}

export function getMutation(
  state: any,
  props: {
    type: string | ((...params: any[]) => RequestAction);
    requestKey?: string;
  },
): MutationState;

export function getMutationSelector(props: {
  type: string | ((...params: any[]) => RequestAction);
  requestKey?: string;
}): (state: any) => MutationState;

export const isRequestAction: (action: AnyAction) => boolean;

export const isRequestActionQuery: (requestAction: RequestAction) => boolean;

export const isResponseAction: (action: AnyAction) => boolean;
