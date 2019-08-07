import * as React from 'react';

interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  pending: number;
  mutations: any;
  [extraProperty: string]: any;
}

interface LoadingProps {
  [loadingProp: string]: any;
}

interface ErrorProps {
  error: any;
  [errorProp: string]: any;
}

interface CommonQueryProps<QueryStateData> {
  children?:
    | React.ReactNode
    | ((query: QueryState<QueryStateData>) => React.ReactNode);
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

interface QueryProps<QueryStateData> extends CommonQueryProps<QueryStateData> {
  query: QueryState<QueryStateData>;
}

export class Query<QueryStateData = any> extends React.Component<
  QueryProps<QueryStateData>
> {}

interface ConnectedQueryProps<QueryStateData>
  extends CommonQueryProps<QueryStateData> {
  requestSelector?: (state: any) => QueryState<QueryStateData>;
  type?: string;
}

export class ConnectedQuery<QueryStateData = any> extends React.Component<
  ConnectedQueryProps<QueryStateData>
> {}

interface MutationState {
  pending: number;
  error: any;
}

interface MutationProps {
  children?: (props: { loading: boolean; error: any }) => React.ReactNode;
  component?: React.ComponentType<{
    loading: boolean;
    error: any;
    [extraProperty: string]: any;
  }>;
  mutation: MutationState;
  requestKey?: string;
  [extraProperty: string]: any;
}

export class Mutation extends React.Component<MutationProps> {}

interface ConnectedMutationProps {
  children?: (props: { loading: boolean; error: any }) => React.ReactNode;
  component?: React.ComponentType<{
    loading: boolean;
    error: any;
    [extraProperty: string]: any;
  }>;
  requestKey?: string;
  requestSelector?: (state: any) => QueryState<any>;
  type: string;
  [extraProperty: string]: any;
}

export class ConnectedMutation extends React.Component<
  ConnectedMutationProps
> {}
