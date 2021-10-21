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
  poll?: number;
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
      payload?: never;
      request: any | any[];
      meta?: RequestActionMeta<Data, TransformedData>;
    }
  | {
      type?: string;
      payload: {
        request: any | any[];
      };
      request?: never;
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

interface SubscriptionActionMeta {
  requestKey?: string;
  normalize?: boolean;
  mutations?: {
    [actionType: string]: (
      data: any,
      subscriptionData: any,
      message: any,
    ) => any;
  };
  getData?: (data: any) => any;
  onMessage?: (data: any, message: any, store: RequestsStore) => void;
  [extraProperty: string]: any;
}

export type SubscriptionAction =
  | {
      type?: string;
      subscription: any;
      meta?: SubscriptionActionMeta;
    }
  | {
      type?: string;
      payload: {
        subscription: any;
      };
      meta?: SubscriptionActionMeta;
    };

type ResponseData<
  Request extends (...args: any[]) => RequestAction
> = ReturnType<NonNullable<ReturnType<Request>['meta']>['getData']>;

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

export interface Subscriber {
  url: string;
  protocols?: string | string[];
  WS?: any;
  onOpen?: (store: RequestsStore, ws: any, props?: any) => void;
  onClose?: (e: any, store: RequestsStore, ws: any) => void;
  onError?: (e: any, store: RequestsStore, ws: any) => void;
  onMessage?: (data: any, message: any, store: RequestsStore) => void;
  onSend?: (message: any, action: AnyAction) => any;
  activateOn?: (message: any) => boolean;
  getData?: (data: any) => any;
  onStopSubscriptions?: (
    stoppedSubscriptions: string[],
    action: AnyAction,
    ws: any,
    store: RequestsStore,
  ) => void;
  lazy?: boolean;
  isHeartbeatMessage?: (message: any) => boolean;
  heartbeatTimeout?: number;
  reconnectTimeout?: number;
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
  subscriber?: Subscriber;
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

export const stopPolling: (
  requests?: (string | { requestType: string; requestKey: string })[],
) => {
  type: string;
  requests: (string | { requestType: string; requestKey: string })[];
};

export const openWebsocket: (
  props?: any,
) => {
  type: string;
  props: any;
};

export const closeWebsocket: (
  code?: number,
) => {
  type: string;
  code: string | null;
};

export const stopSubscriptions: (
  subscriptions?: string[],
) => {
  type: string;
  subscriptions?: string[] | null;
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

export function getWebsocketState(): { pristine: boolean; connected: boolean };

export const isRequestAction: (action: AnyAction) => boolean;

export const isRequestActionQuery: (requestAction: RequestAction) => boolean;

export const isResponseAction: (action: AnyAction) => boolean;
