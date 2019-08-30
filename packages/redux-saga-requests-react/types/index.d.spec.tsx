import * as React from 'react';
import { Query, Mutation, useQuery, useMutation } from './index';

const query = useQuery<string>({ type: 'Query' });
const query2 = useQuery({
  type: 'Query',
  requestSelector: () => ({ data: { nested: 1 }, pending: 1, error: null }),
  multiple: true,
  defaultData: {},
});
const mutation = useMutation({ type: 'Mutation' });
const mutation2 = useMutation({
  type: 'Mutation',
  requestSelector: () => ({ data: 'data', pending: 1, error: null }),
});

function BasicQuery() {
  return (
    <Query<string>
      requestSelector={state => ({
        data: 'x',
        error: null,
        pending: 1,
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
      type="TYPE"
      requestKey="key"
      requestSelector={state => ({
        data: 'x',
        error: null,
        pending: 1,
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
