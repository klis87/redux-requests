import * as React from 'react';
import { Query, Mutation, useQuery, useMutation } from './index';

const query = useQuery<string>({ type: 'Query' });
const query2 = useQuery({
  type: 'Query',
  multiple: true,
  defaultData: {},
});
const mutation = useMutation({ type: 'Mutation' });
const mutation2 = useMutation({
  type: 'Mutation',
  requestKey: 'key',
});

function BasicQuery() {
  return (
    <Query<string>
      selector={state => ({
        data: 'x',
        error: null,
        loading: true,
        pristine: false,
      })}
      type="TYPE"
    >
      {({ data }) => data}
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

function Component({ query, extra }) {
  return (
    <div>
      {query.data as number} {extra}
    </div>
  );
}

function QueryWithComponents() {
  return (
    <Query<string>
      type="QUERY"
      component={Component}
      loadingComponent={Spinner}
      loadingComponentProps={{ extra: 'extra' }}
      errorComponent={Error}
      errorComponentProps={{ extra: 'extra' }}
      noDataMessage={<span>No data</span>}
      showLoaderDuringRefetch={false}
      isDataEmpty={query => true}
    />
  );
}

function BasicMutation() {
  return (
    <Mutation type="Mutation">
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </Mutation>
  );
}

function MutationComponent({ mutation, extra }) {
  return (
    <div>
      {mutation.loading && 'loading'}
      {mutation.error}
      {extra}
    </div>
  );
}

function MutationWithCustomComponent() {
  return (
    <Mutation
      type="MUTATION"
      requestKey="key"
      component={MutationComponent}
      extra="extra"
    />
  );
}

function MutationWithSelector() {
  return (
    <Mutation
      selector={state => ({
        error: null,
        loading: false,
      })}
    >
      {({ loading, error }) => (
        <div>
          {loading && 'loading'}
          {error}
        </div>
      )}
    </Mutation>
  );
}
