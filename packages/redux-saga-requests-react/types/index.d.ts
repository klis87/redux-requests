import * as React from 'react';

import { RequestAction } from 'redux-saga-requests';

interface Request<RequestData> {
  data: RequestData;
  error: any;
  pending: number;
  operations: any;
  [extraProperty: string]: any;
}

interface LoadingProps {
  [loadingProp: string]: any;
}

interface ErrorProps {
  error: any;
  [errorProp: string]: any;
}

interface CommonRequestContainerProps<RequestData> {
  children?:
    | React.ReactNode
    | ((request: Request<RequestData>) => React.ReactNode);
  component?: React.ComponentType<{
    request: Request<RequestData>;
    [extraProperty: string]: any;
  }>;
  isDataEmpty?: (request: Request<RequestData>) => boolean;
  showLoaderDuringRefetch?: boolean;
  noDataMessage?: React.ReactNode;
  errorComponent?: React.ComponentType<ErrorProps>;
  errorComponentProps?: { [errorProp: string]: any };
  loadingComponent?: React.ComponentType<LoadingProps>;
  loadingComponentProps?: LoadingProps;
  [extraProperty: string]: any;
}

interface RequestContainerProps<RequestData>
  extends CommonRequestContainerProps<RequestData> {
  request: Request<RequestData>;
}

export class RequestContainer<RequestData = any> extends React.Component<
  RequestContainerProps<RequestData>
> {}

interface ConnectedRequestContainerProps<RequestData>
  extends CommonRequestContainerProps<RequestData> {
  requestSelector: (state: any) => Request<RequestData>;
}

export class ConnectedRequestContainer<
  RequestData = any
> extends React.Component<ConnectedRequestContainerProps<RequestData>> {}

interface Operation {
  error: any;
  pending: number;
}

interface OperationContainerProps {
  children?: (props: { loading: boolean; error: any }) => React.ReactNode;
  component?: React.ComponentType<{
    loading: boolean;
    error: any;
    [extraProperty: string]: any;
  }>;
  operation: Operation;
  requestKey?: string;
  [extraProperty: string]: any;
}

export class OperationContainer extends React.Component<
  OperationContainerProps
> {}

interface ConnectedOperationContainerProps {
  children?: (props: {
    loading: boolean;
    error: any;
    sendOperation: any;
  }) => React.ReactNode;
  component?: React.ComponentType<{
    loading: boolean;
    error: any;
    sendOperation: any;
    [extraProperty: string]: any;
  }>;
  requestKey?: string;
  operation?: Operation;
  requestSelector?: (state: any) => Request<any>;
  operationType?: string;
  operationCreator?: (...args: any[]) => RequestAction;
  [extraProperty: string]: any;
}

export class ConnectedOperationContainer extends React.Component<
  ConnectedOperationContainerProps
> {}
