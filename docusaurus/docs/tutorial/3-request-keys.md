---
title: 3. Request keys
description: 3rd part of the tutorial for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## Sending requests with `requestKey`

Let's bring back **batch requests** action from the previous part of the tutorial:

```js
const fetchBook = ids => ({
  type: FETCH_BOOK,
  request: ids.map(id => ({ url: `/books/${id}` }),
});
```

This is a good way to handle a case, in which you must fetch multiple details of
some objects at the same time. However, what if you need to fetch new instances gradually?
For instance, what if you need to fetch books with `ids: ['1', '2']`, but later you
would like to fetch `3` but without removing `1` and `2`? Dispatching `ids: ['3']`
would just erase books `1` and `2`. On the other hand, using `ids: ['1', '2', '3']`
would not be very optimal, because you would refetch books `1` and `2` which you
already had.

To tackle this situation, you can use `meta.requestKey` option:

```js
const fetchBook = id => ({
  type: FETCH_BOOK,
  request: {
    url: `/books/${id}`,
  },
  meta: {
    requestKey: id, // it should be string
  },
});
```

So what `requestKey` does? Well, it tells `requestsReducer` to store `FETCH_BOOK`
queries per each `requestKey` individually. So if you do:

```js
store.dispatch(fetchBook('1'));
// later
store.dispatch(fetchBook('2'));
```

then the second request won't erase book `1` anymore. Additionally, doing:

```js
store.dispatch(fetchBook('1'));
store.dispatch(fetchBook('2'));
```

won't cause pending request for book `1` to be aborted, because now they are treated and stored
separately. However, dispatching multiple requests with the same `requestKey` at
the same time would still abort previous pending requests like described in abort part of the tutorial.

## Selectors with `requestKey`

When using `requestKey`, you need to remember to pass a matching `requestKey`
to selectors, for example:

```js
import { getQuery } from '@redux-requests/core';

const { data, error, loading } = getQuery(state, {
  type: FETCH_BOOK,
  requestKey: '1',
});
```

Otherwise `getQuery` would just return `{ data: null, loading: false, error: null}`,
because it wouldn't know which query to retrieve.

The same applies to `getMutation`.

## Updating data of queries with `requestKey`

Let's write a simple mutation to update book:

```js
const updateBook = (id, title) => ({
  type: UPDATE_BOOK,
  request: {
    url: `/books/${id}`,
    method: 'post',
    data: { title },
  },
  meta: {
    mutations: {
      [FETCH_BOOK]: (data, mutationData) => mutationData,
    },
  },
});
```

If you try it, you will quickly find out that for some reason query data is not updated
properly. This is due to the same reason like in selectors, you need to pass a mathing
`requestKey` in `mutations`, like:

```js
const updateBook = (id, title) => ({
  type: UPDATE_BOOK,
  request: {
    url: `/books/${id}`,
    method: 'post',
    data: { title },
  },
  meta: {
    mutations: {
      [FETCH_BOOK + id]: (data, mutationData) => mutationData,
    },
  },
});
```

So, all you need to do is add the matching `requestKey` to query type.

## Mutations with `requestKey`

Interestingly, not only queries can have `requestKey`. It can be useful to use it
for mutations too, for example if you wanted to show multiple loading spinners
or errors at the same time:

```js
const updateBook = (id, title) => ({
  type: UPDATE_BOOK,
  request: {
    url: `/books/${id}`,
    method: 'post',
    data: { title },
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_BOOK + id]: (data, mutationData) => mutationData,
    },
  },
});
```

## `abortActions` and `resetActions` with `requestKey`

To use `abortActions` and `resetActions` with `requestKey`, you must pass an object
with `requestType` and `requestKey` instead of `string`, for example:

```js
dispatch(abortRequests({ requestType: FETCH_BOOK, requestKey: '1' }]));
```

## `requestsCapacity`

You might think about `requestKey` concept - that's cool, but what about garbage collection
and memory pollution? That's where `meta.requestsCapacity` comes in:

```js
const fetchBook = id => ({
  type: FETCH_BOOK,
  request: {
    url: `/books/${id}`,
  },
  meta: {
    requestKey: id, // it should be string
    requestsCapacity: 3,
  },
});
```

If not provided, your reducers will grow and grow, keeping requests with all used `requestKey`s.
However, in some cases number of stored requests could exceed thousands! To avoid that,
you could use `meta.requestsCapacity`, which automatically manages requests with the same
type but different keys according to FIFO (first in first out) rule. For instance,
passing `requestsCapacity: 3` would allow only 3 requests to be stored at the same time.
For 4th request, the 1st one would be automatically removed.
