import * as React from 'react';
import { Query, ConnectedQuery, Mutation, ConnectedMutation } from './index';

function BasicQuery() {
  return (
    <Query query={{ data: null, error: null, pending: 1, mutations: [] }}>
      {null}
    </Query>
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

function AdvancedQuery() {
  return (
    <Query
      query={{ data: 'data', error: null, pending: 1, mutations: [] }}
      loadingComponent={Spinner}
      loadingComponentProps={{ extra: 'extra' }}
      errorComponent={Error}
      errorComponentProps={{ extra: 'extra' }}
      noDataMessage={<span>No data</span>}
      showLoaderDuringRefetch={false}
      isDataEmpty={query => true}
    >
      {({ data }) => <div>{data}</div>}
    </Query>
  );
}

function Component({ query, x }) {
  return (
    <div>
      {query} {x}
    </div>
  );
}

function QuerywithComponentProp() {
  return (
    <Query
      query={{ data: 'data', error: null, pending: 1, mutations: [] }}
      component={Component}
      x={1}
    />
  );
}

function BasicConnectedQuery() {
  return (
    <ConnectedQuery
      requestSelector={state => ({
        data: 'x',
        error: null,
        pending: 1,
        mutations: [],
      })}
      type="TYPE"
    >
      {query => query.data}
    </ConnectedQuery>
  );
}

function RenderPropMutation() {
  return (
    <Mutation mutation={{ pending: 1, error: 1 }}>
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </Mutation>
  );
}

function MutationComponent({ loading, error, extra }) {
  return (
    <div>
      {loading && 'loading'}
      {error}
      {extra}
    </div>
  );
}

function MutationWithCustomComponent() {
  return (
    <Mutation
      mutation={{ pending: 1, error: 'error' }}
      requestKey="key"
      component={MutationComponent}
      extra="extra"
    />
  );
}

function BasicConnectedMutation() {
  return (
    <ConnectedMutation type="TYPE">
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </ConnectedMutation>
  );
}

function ConnectedMutationWithSelector() {
  return (
    <ConnectedMutation
      type="TYPE"
      requestKey="key"
      requestSelector={state => ({
        data: 'x',
        error: null,
        pending: 1,
        mutations: [],
      })}
    >
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </ConnectedMutation>
  );
}
