import * as React from 'react';
import { Reducer, Middleware, Store } from 'redux';
import {
  QueryState,
  MutationState,
  RequestAction,
  DispatchRequest,
  HandleRequestConfig,
  RequestsStore,
  SubscriptionAction,
} from '@redux-requests/core';

interface RequestCreator<QueryStateData = any> {
  (...args: any[]): RequestAction<any, QueryStateData>;
}

interface SubscriptionCreator {
  (...args: any[]): SubscriptionAction;
}

type GetQueryStateData<T extends RequestCreator> = T extends RequestCreator<
  infer QueryStateData
>
  ? QueryStateData
  : never;

export function useQuery<
  Data = undefined,
  QueryCreator extends RequestCreator = any
>(props: {
  type: string | QueryCreator;
  action?: QueryCreator;
  requestKey?: string;
  variables?: Parameters<QueryCreator>;
  autoLoad?: boolean;
  autoReset?: boolean;
  throwError?: boolean;
  suspense?: boolean;
  suspenseSsr?: boolean;
}): QueryState<
  Data extends undefined ? GetQueryStateData<QueryCreator> | null : Data
> & {
  load: () => Promise<{
    data?: QueryState<
      Data extends undefined ? GetQueryStateData<QueryCreator> : Data
    >;
    error?: any;
    isAborted?: true;
    action: any;
  }>;
  stopPolling: () => void;
};

export function useMutation<
  Data = undefined,
  MutationCreator extends RequestCreator = any
>(props: {
  type: string | MutationCreator;
  action?: MutationCreator;
  requestKey?: string;
  variables?: Parameters<MutationCreator>;
  autoReset?: boolean;
  throwError?: boolean;
  suspense?: boolean;
}): MutationState & {
  mutate: () => Promise<{
    data?: QueryState<
      Data extends undefined ? GetQueryStateData<MutationCreator> : Data
    >;
    error?: any;
    isAborted?: true;
    action: any;
  }>;
};

export function useSubscription<SC extends SubscriptionCreator = any>(props: {
  type: string | SC;
  action?: SC;
  requestKey?: string;
  variables?: Parameters<SC>;
  active?: boolean;
}): void;

export function useDispatchRequest(): DispatchRequest;

type RequestsProviderProps = (
  | {
      requestsConfig: HandleRequestConfig;
      extraReducers?: Reducer[];
      getMiddleware?: (extraMiddleware: Middleware[]) => Middleware[];
      store?: never;
    }
  | {
      store: Store;
      requestsConfig?: never;
      extraReducers?: never;
      getMiddleware?: never;
    }
) & {
  children: React.ReactNode;
  autoLoad?: boolean;
  autoReset?: boolean;
  throwError?: boolean;
  suspense?: boolean;
  suspenseSsr?: boolean;
  getStore?: (store: RequestsStore) => void;
  initialState?: any;
};

export class RequestsProvider extends React.Component<RequestsProviderProps> {}

interface RequestsErrorBoundaryProps {
  type: string | ((...params: any[]) => RequestAction);
  requestKey?: string;
  autoReset?: boolean;
  children: React.ReactNode;
  fallback: (error: {
    error: any;
    type: string;
    requestKey: string;
  }) => React.ReactNode;
}

export class RequestsErrorBoundary extends React.Component<RequestsErrorBoundaryProps> {}
