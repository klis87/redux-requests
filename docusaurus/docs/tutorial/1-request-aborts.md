---
title:  1. Requests aborts
---


## Basic setup

Before we begin, make sure you read `basic-usage` chapter. Now, let's start with
basic setup:
```js
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';

const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(axios),
  });

  const reducers = combineReducers({
    requests: requestsReducer,
  });

  const store = createStore(
    reducers,
    applyMiddleware(...requestsMiddleware),
  );

  return store;
};
```

Now, imagine we need to fetch books which are paginated on the server. We start
with writing a request action:
```js
const FETCH_BOOKS = 'FETCH_BOOKS';

const fetchBooks = page => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    params: { page },
  },
});
```

We pass `page` param to `fetchBooks` action, because as described earlier, books
are paginated on the backend side.

Once we have the action ready, let's download the 1st page of books:
```js
store.dispatch(fetchBooks(1));
```

What will happen then? `FETCH_BOOKS` action will be dispatched,
then AJAX request will be made and depending on the outcome, either `FETCH_BOOKS_SUCCESS`
or `FETCH_BOOKS_ERROR` action will be dispatched with the server response.

But there is yet another possibility, imagine that we dispatch `fetchBooks` whenever
a user wants to see a page. There is an interesting case, when the user is faster
than our network. Let's simulate this behaviour:
```js
store.dispatch(fetchBooks(1));
store.dispatch(fetchBooks(2));
```

In above situation, we ask for page `2` while request for page `1` is still pending.
Now, what will actually happen is the following dispatch sequence:

1. `FETCH_BOOKS`
1. `FETCH_BOOKS`
1. `FETCH_BOOKS_ABORT`
1. `FETCH_BOOKS_SUCCESS`

What is `FETCH_BOOKS_ABORT`? As you probably know, AJAX requests can be possibly aborted.
Sometimes you might want to cancel a pending request because its response is not needed anymore.
Aborting is a good thing then because it releases resources. But often aborting requests
is even more important because it prevents many race conditions bugs before they even happen!

## Importance of requests aborts

In real life, you cannot predict how long a request will take. If you fetch 1st page of
books, then quickly 2nd one, it could easily happen that response for the 1st page could
be received after 2nd, despite the fact request order was different! So without being cautious
here, user could see books from page 1 being on 2nd page!

So, going back, `redux-requests` has first class support for requests aborts. By default,
if a query of a given type is pending and a new one is fired, the previous request will be
automatically aborted.

##  Requests aborts configuration

By default only queries are aborted this way, mutations are not. You can easily change
those defaults by a special `takeLatest` option, which can be passed either to `handleRequests`
for global configuration or in request action `meta`.

If for a some reason you would like to prevent aborts for `FETCH_BOOKS`, you could
do it like that:
```js
const fetchBooks = page => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    params: { page },
  },
  meta: {
    takeLatest: false,
  },
});
```

Or... if you had a mutation which you would like to have aborted, you would add
`meta.takeLatest: true`.

As mentioned above, you can configure it globally by using `takeLatest` option
in `handleRequest`. As mentioned earlier, default implementation uses aborts only for
queries and it looks like that:
```js
import { isRequestActionQuery } from '@redux-requests/core';

const takeLatest = action => isRequestActionQuery(action);
// or just shorter
// const takeLatest = isRequestActionQuery;
```

## `abortRequests`

Sometimes you might need to abort some pending requests manually.
You can use `abortRequests` action to do it, for example:
```js
import { abortRequests } from '@redux-requests/core';

// abort everything
dispatch(abortRequests());

// abort FETCH_BOOKS
dispatch(abortRequests([FETCH_BOOKS]));

// abort FETCH_BOOKS and FETCH_BOOK with 1 request key
// you will learn about requestKey in another tutorial
dispatch(abortRequests([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]));
```

## `resetRequests`

It is also possible to abort requests with `resetRequests` action, but this will be covered
in another tutorial.
