import * as React from 'react';
import { MutationState, QueryState, RequestAction } from '@redux-requests/core';

import { useQuery, useMutation, useDispatchRequest } from './index';

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

const QueryDispatcher = () => {
  const dispatch = useDispatchRequest();

  return (
    <button
      onClick={async () => {
        const response = await dispatch(fetchBooks(1, '1', { a: false }));
        response.data?.parsed;
        const response2 = await dispatch(fetchBook('1'));
        response2.data?.title;
      }}
    >
      Make a query
    </button>
  );
};
