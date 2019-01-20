import * as React from 'react';
import {
  RequestContainer,
  ConnectedRequestContainer,
  OperationContainer,
  ConnectedOperationContainer,
} from './index';

function BasicRequestContainer() {
  return (
    <RequestContainer
      request={{ data: null, error: null, pending: 1, operations: [] }}
    >
      {null}
    </RequestContainer>
  );
}

function Spinner({ extra }) {
  return <span>loading... {extra}</span>;
}

function Error({ error, extra }) {
  return (
    <span>
      {error} {extra}
    </span>
  );
}

function AdvancedRequestContainer() {
  return (
    <RequestContainer
      request={{ data: 'data', error: null, pending: 1, operations: [] }}
      loadingComponent={Spinner}
      loadingComponentProps={{ extra: 'extra' }}
      errorComponent={Error}
      errorComponentProps={{ extra: 'extra' }}
      noDataMessage={<span>No data</span>}
      showLoaderDuringRefetch={false}
      isDataEmpty={request => true}
    >
      {({ data }) => <div>{data}</div>}
    </RequestContainer>
  );
}

function Component({ request, x }) {
  return (
    <div>
      {request} {x}
    </div>
  );
}

function RequestContainerwithComponentProp() {
  return (
    <RequestContainer
      request={{ data: 'data', error: null, pending: 1, operations: [] }}
      component={Component}
      x={1}
    />
  );
}

function BasicConnectedRequestContainer() {
  return (
    <ConnectedRequestContainer
      requestSelector={state => ({
        data: 'x',
        error: null,
        pending: 1,
        operations: [],
      })}
    >
      {request => request.data}
    </ConnectedRequestContainer>
  );
}

function RenderPropOperationContainer() {
  return (
    <OperationContainer operation={{ pending: 1, error: 1 }}>
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </OperationContainer>
  );
}

function OperationComponent({ loading, error, extra }) {
  return (
    <div>
      {loading && 'loading'}
      {error}
      {extra}
    </div>
  );
}

function OperationContainerWithCustomComponent() {
  return (
    <OperationContainer
      operation={{ pending: 1, error: 'error' }}
      requestKey="key"
      component={OperationComponent}
      extra="extra"
    />
  );
}

function BasicConnectedOperationContainer() {
  return (
    <ConnectedOperationContainer operation={{ pending: 1, error: 'error' }}>
      {({ loading, error, sendOperation }) => (
        <div>
          {loading && 'loading'}
          {error}
          <button onClick={sendOperation}>Send</button>
        </div>
      )}
    </ConnectedOperationContainer>
  );
}

function ConnectedOperationContainerWithSelector() {
  return (
    <ConnectedOperationContainer
      operationType="operationType"
      operationCreator={x => ({
        type: 'operationType',
        request: { x },
      })}
      requestKey="key"
      requestSelector={state => ({
        data: 'x',
        error: null,
        pending: 1,
        operations: [],
      })}
    >
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </ConnectedOperationContainer>
  );
}
