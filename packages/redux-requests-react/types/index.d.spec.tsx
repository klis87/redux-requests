import * as React from 'react';
import { RequestAction } from '@redux-requests/core';

import {
  Query,
  Mutation,
  useQuery,
  useMutation,
  useDispatchRequest,
} from './index';

function ordinaryEvent(payload: string) {
  return {
    type: 'ORDINARY_EVENT',
    payload: payload
  };
}

function fetchBooks(
  x: number,
  y: string,
  z: { a: boolean },
): RequestAction<{ raw: boolean }, { parsed: boolean }> {
  return {
    type: 'FETCH_BOOKS',
    request: {
      url: '/books',
      x,
      y,
      a: z.a,
    },
    meta: {
      getData: data => ({ parsed: data.raw }),
    },
  };
}

function fetchBook(id: string): RequestAction<{ id: string; title: string }> {
  return {
    type: 'FETCH_BOOK',
    request: {
      url: '/book',
    },
  };
}

function updateBook(id: string): RequestAction<{ id: string; title: string }> {
  return {
    type: 'FETCH_BOOK',
    request: {
      url: '/book',
      method: 'post',
      data: { id },
    },
  };
}

const query = useQuery<string>({ type: 'Query' });
const query2 = useQuery<number>({
  type: 'Query',
  multiple: true,
  defaultData: {},
  variables: [{ x: 1, y: 2 }],
});
query2.data;

const query3 = useQuery({
  type: fetchBooks,
  action: fetchBooks,
  autoLoad: true,
  variables: [1, '1', { a: true }],
});
query3.data;
const x = query3.load();

const query4 = useQuery({ type: 'FETCH_BOOKS', action: fetchBooks });

const mutation = useMutation<string>({ type: 'Mutation' });
const r = mutation.mutate();
const mutation2 = useMutation({
  type: 'Mutation',
  requestKey: 'key',
});
const mutation3 = useMutation({
  type: updateBook,
  variables: ['1'],
});
const r2 = mutation3.mutate();

function BasicQuery() {
  return (
    <Query<string>
      selector={state => ({
        data: 'x',
        error: null,
        loading: true,
        pending: 1,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      })}
      type="TYPE"
    >
      {({ data }) => data}
    </Query>
  );
}

function BasicQuery2() {
  return <Query type={fetchBooks}>{({ data }) => data}</Query>;
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
      loadingComponentProps={{
        extra: 'extra',
      }}
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
        pending: 1,
        downloadProgress: null,
        uploadProgress: null,
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

const QueryDispatcher = () => {
  const dispatch = useDispatchRequest();

  return (
    <button
      onClick={async () => {
        const response = await dispatch(fetchBooks(1, '1', { a: false }));
        response.data.parsed;
        const response2 = await dispatch(fetchBook('1'));
        response2.data.title;
        const response3 = await dispatch(ordinaryEvent('payload'));
        response3.payload;
      }}
    >
      Make a query
    </button>
  );
};
