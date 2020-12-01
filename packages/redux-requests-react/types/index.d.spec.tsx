import * as React from 'react';
import { RequestAction } from '@redux-requests/core';

import {
  Query,
  Mutation,
  useQuery,
  useMutation,
  useDispatchRequest,
} from './index';

const fetchBooks: () => RequestAction<
  { raw: boolean },
  { parsed: boolean }
> = () => {
  return {
    type: 'FETCH_BOOKS',
    request: {
      url: '/books',
    },
    meta: {
      getData: data => ({ parsed: data.raw }),
    },
  };
};

function fetchBook(id: string): RequestAction<{ id: string; title: string }> {
  return {
    type: 'FETCH_BOOK',
    request: {
      url: '/book',
    },
  };
}

const query = useQuery<string>({ type: 'Query' });
const query2 = useQuery({
  type: 'Query',
  multiple: true,
  defaultData: {},
});
const query3 = useQuery({ type: fetchBooks });
const query4 = useQuery({ type: 'FETCH_BOOKS', action: fetchBooks });

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
        const response = await dispatch(fetchBooks());
        response.data.parsed;
        const response2 = await dispatch(fetchBook('1'));
        response2.data.title;
      }}
    >
      Make a query
    </button>
  );
};
