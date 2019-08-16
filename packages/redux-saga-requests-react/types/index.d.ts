import * as React from 'react';

interface QueryState<QueryStateData> {
  data: QueryStateData;
  error: any;
  loading: boolean;
}

interface LoadingProps {
  [loadingProp: string]: any;
}

interface ErrorProps {
  error: any;
  [errorProp: string]: any;
}

type RequestSelector<QueryStateData> = (
  state: any,
) => Omit<QueryState<QueryStateData>, 'loading'> & { pending: number };

interface QueryProps<QueryStateData> {
  requestSelector?: RequestSelector<QueryStateData>;
  type?: string;
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

interface MutationState {
  loading: boolean;
  error: any;
}

interface MutationProps {
  requestKey?: string;
  requestSelector?: RequestSelector<any>;
  type: string;
  children?: (mutation: MutationState) => React.ReactNode;
  component?: React.ComponentType<{
    mutation: MutationState;
    [extraProperty: string]: any;
  }>;
  [extraProperty: string]: any;
}

export class Mutation extends React.Component<MutationProps> {}

export function useQuery<QueryStateData = any>(props: {
  type?: string;
  requestSelector?: RequestSelector<QueryStateData>;
}): QueryState<QueryStateData>;

export function useMutation(props: {
  type: string;
  requestKey?: string;
  requestSelector?: RequestSelector<any>;
}): MutationState;
