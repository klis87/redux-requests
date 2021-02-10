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

interface LoadingProps {
  downloadProgress?: number | null;
  uploadProgress?: number | null;
  [loadingProp: string]: any;
}

interface ErrorProps {
  error?: any;
  [errorProp: string]: any;
}

interface QueryProps<QueryStateData> {
  type?: string | ((...params: any[]) => RequestAction<any, QueryStateData>);
  action?: (...params: any[]) => RequestAction<any, QueryStateData>;
  requestKey?: string;
  multiple?: boolean;
  defaultData?: any;
  selector?: (state: any) => QueryState<QueryStateData>;
  children?: (query: QueryState<QueryStateData>) => React.ReactNode;
  component?: React.ComponentType<{
    query: QueryState<QueryStateData>;
    [extraProperty: string]: any;
  }>;
  isDataEmpty?: (query: QueryState<QueryStateData>) => boolean;
  showLoaderDuringRefetch?: boolean;
  noDataMessage?: React.ReactNode;
  errorComponent?: React.ComponentType<ErrorProps>;
  errorComponentProps?: { [errorProp: string]: any };
  loadingComponent?: React.ComponentType<LoadingProps>;
  loadingComponentProps?: { [loadingProp: string]: any };
  [extraProperty: string]: any;
}

export class Query<QueryStateData = any> extends React.Component<
  QueryProps<QueryStateData>
> {}

interface MutationProps {
  type?: string | ((...params: any[]) => RequestAction);
  requestKey?: string;
  selector?: (state: any) => MutationState;
  children?: (mutation: MutationState) => React.ReactNode;
  component?: React.ComponentType<{
    mutation: MutationState;
    [extraProperty: string]: any;
  }>;
  [extraProperty: string]: any;
}

export class Mutation extends React.Component<MutationProps> {}

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
  multiple?: boolean;
  defaultData?: any;
  variables?: Parameters<QueryCreator>;
  autoLoad?: boolean;
  autoReset?: boolean;
  throwError?: boolean;
  suspense?: boolean;
  suspenseSsr?: boolean;
}): QueryState<
  Data extends undefined ? GetQueryStateData<QueryCreator> : Data
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

interface RequestsProviderProps {
  children: React.ReactNode;
  requestsConfig: HandleRequestConfig;
  extraReducers?: Reducer[];
  getMiddleware?: (extraMiddleware: Middleware[]) => Middleware[];
  autoLoad?: boolean;
  autoReset?: boolean;
  throwError?: boolean;
  suspense?: boolean;
  suspenseSsr?: boolean;
  store?: Store;
  getStore?: (store: RequestsStore) => void;
  initialState?: any;
}

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
