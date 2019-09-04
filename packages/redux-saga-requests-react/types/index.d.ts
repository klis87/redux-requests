import * as React from 'react';
import { QueryState, MutationState } from 'redux-saga-requests';

interface LoadingProps {
  [loadingProp: string]: any;
}

interface ErrorProps {
  error: any;
  [errorProp: string]: any;
}

interface QueryProps<QueryStateData> {
  type?: string;
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
  loadingComponentProps?: LoadingProps;
  [extraProperty: string]: any;
}

export class Query<QueryStateData = any> extends React.Component<
  QueryProps<QueryStateData>
> {}

interface MutationProps {
  type?: string;
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

export function useQuery<QueryStateData = any>(props: {
  type: string;
  multiple?: boolean;
  defaultData?: any;
}): QueryState<QueryStateData>;

export function useMutation(props: {
  type: string;
  requestKey?: string;
}): MutationState;
