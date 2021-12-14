import { AnyAction, Reducer, Middleware, Store } from 'redux';

interface Config {
  [key: string]: any;
}

interface FilterActions {
  (action: AnyAction): boolean;
}

interface ModifyData {
  (data: any, mutationData: any): any;
}

type ActionTypeModifier = (actionType: string) => string;

export const success: ActionTypeModifier;

export const error: ActionTypeModifier;

export const abort: ActionTypeModifier;

interface RequestMeta<Data, TransformedData> {
  driver?: string;
  takeLatest?: boolean;
  getData?: (data: Data, currentData: TransformedData) => TransformedData;
  getError?: (error: any) => any;
  requestKey?: string;
  requestsCapacity?: number;
  normalize?: boolean;
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
}

interface QueryMeta<Data, TransformedData>
  extends RequestMeta<Data, TransformedData> {
  requestType: 'QUERY';
  cache?: boolean | number;
  cacheKey?: string;
  poll?: number;
  dependentRequestsNumber?: number;
  isDependentRequest?: boolean;
}

interface MutationMeta<Data, TransformedData>
  extends RequestMeta<Data, TransformedData> {
  requestType: 'MUTATION';
  mutations?: {
    [actionType: string]:
      | ModifyData
      | {
          updateData?: ModifyData;
          updateDataOptimistic?: (data: any) => any;
          revertData?: (data: any) => any;
        };
  };
  optimisticData?: any;
  revertedData?: any;
}

interface LocalMutationMeta {
  requestType: 'LOCAL_MUTATION';
  mutations?: {
    [actionType: string]: ModifyData;
  };
  localData?: any;
}

interface SubscriptionMeta {
  requestType: 'SUBSCRIPTION';
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
}

export interface Query<Data, TransformedData> {
  type: string;
  payload: any | any[];
  meta?: QueryMeta<Data, TransformedData>;
}

export interface Mutation<Data, TransformedData> {
  type: string;
  payload: any | any[];
  meta?: MutationMeta<Data, TransformedData>;
}

export interface LocalMutation {
  type: string;
  meta: LocalMutationMeta;
}

export interface Subscription {
  type: string;
  payload: any;
  meta?: SubscriptionMeta;
}

export interface Dispatch {
  <Action = AnyAction>(action: Action): Action extends
    | Query<any, infer Data>
    | Mutation<any, infer Data>
    ? Promise<{
        data?: Data;
        error?: any;
        isAborted?: true;
        action: any;
      }>
    : Action;
}

interface RequestsStore extends Store {
  dispatch: Dispatch;
}

export function createQuery<
  Data = any,
  TransformedData = Data,
  Variables extends any[] = any[]
>(
  type: string,
  requestConfig: Config | ((...params: Variables) => Config),
  metaConfig?:
    | QueryMeta<Data, TransformedData>
    | ((...params: Variables) => QueryMeta<Data, TransformedData>),
): (...params: Variables) => Query<Data, TransformedData>;

export function createMutation<
  Data = any,
  TransformedData = Data,
  Variables extends any[] = any[]
>(
  type: string,
  requestConfig: Config | ((...params: Variables) => Config),
  metaConfig?:
    | MutationMeta<Data, TransformedData>
    | ((...params: Variables) => MutationMeta<Data, TransformedData>),
): (...params: Variables) => Mutation<Data, TransformedData>;

export function createLocalMutation<Variables extends any[] = any[]>(
  type: string,
  metaConfig: LocalMutationMeta | ((...params: Variables) => LocalMutationMeta),
): (...params: Variables) => LocalMutation;

export function createSubscription<Variables extends any[] = any[]>(
  type: string,
  requestConfig: Config | ((...params: Variables) => Config) | null,
  metaConfig?: SubscriptionMeta | ((...params: Variables) => SubscriptionMeta),
): (...params: Variables) => Subscription;

type ResponseData<
  Request extends (...args: any[]) => Query | Mutation
> = ReturnType<ReturnType<Request>['meta']['getData']>;

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

export interface QueryState<Data> {
  data: Data;
  error: any;
  pending: number;
  loading: boolean;
  pristine: boolean;
  uploadProgress: number | null;
  downloadProgress: number | null;
}

export function getQuery<Data = any>(
  state: any,
  props: {
    type: (...params: any[]) => Query<any, Data>;
    requestKey?: string;
  },
): QueryState<Data>;

export function getQuerySelector<Data = any>(props: {
  type: (...params: any[]) => Query<any, Data>;
  requestKey?: string;
}): (state: any) => QueryState<Data>;

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
    type: (...params: any[]) => Mutation;
    requestKey?: string;
  },
): MutationState;

export function getMutationSelector(props: {
  type: (...params: any[]) => Mutation;
  requestKey?: string;
}): (state: any) => MutationState;

export function getWebsocketState(): { pristine: boolean; connected: boolean };

export const isRequestAction: (action: AnyAction) => boolean;

export const isRequestActionQuery: (requestAction: RequestAction) => boolean;

export const isResponseAction: (action: AnyAction) => boolean;
