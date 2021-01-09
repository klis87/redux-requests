import { AnyAction, Reducer, Middleware, Store } from 'redux';

export interface DispatchRequest {
  <QueryStateData = any>(
    requestAction: RequestAction<any, QueryStateData>,
  ): Promise<{
    data?: QueryStateData;
    error?: any;
    isAborted?: true;
    action: any;
  }>;
}

interface FilterActions {
  (action: AnyAction): boolean;
}

interface ModifyData {
  (data: any, mutationData: any): any;
}

interface RequestsStore extends Store {
  dispatchRequest: DispatchRequest;
}

export const createRequestsStore: (store: Store) => RequestsStore;

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
  measureDownloadProgress?: boolean;
  measureUploadProgress?: boolean;
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

interface DriverActions {
  setDownloadProgress?: (downloadProgress: number) => void;
  setUploadProgress?: (uploadProgress: number) => void;
}

export interface Driver {
  (
    requestConfig: any,
    requestAction: RequestAction,
    driverActions: DriverActions,
  ): Promise<any>;
}

export interface HandleRequestConfig {
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
  disableRequestsPromise?: boolean;
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
  resetCached?: boolean,
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
  abortPending: boolean;
  resetCached: boolean;
};

export const abortRequests: (
  requests?: (string | { requestType: string; requestKey: string })[],
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
};

export const addWatcher: (
  requestType: string,
) => {
  type: string;
  requestType: string;
};

export const removeWatcher: (
  requestType: string,
) => {
  type: string;
  requestType: string;
};

export const joinRequest: (
  requestType: string,
  rehydrate?: boolean,
) => {
  type: string;
  requestType: string;
  rehydrate: boolean;
};

export interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  pending: number;
  loading: boolean;
  pristine: boolean;
  uploadProgress: number | null;
  downloadProgress: number | null;
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
  pending: number;
  loading: boolean;
  error: any;
  uploadProgress: number | null;
  downloadProgress: number | null;
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
