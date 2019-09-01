# redux-saga-requests

[![npm version](https://badge.fury.io/js/redux-saga-requests.svg)](https://badge.fury.io/js/redux-saga-requests)
[![gzip size](http://img.badgesize.io/https://unpkg.com/redux-saga-requests/dist/redux-saga-requests.min.js?compression=gzip)](https://unpkg.com/redux-saga-requests)
[![dependencies](https://david-dm.org/klis87/redux-saga-requests.svg?path=packages/redux-saga-requests)](https://david-dm.org/klis87/redux-saga-requests?path=packages/redux-saga-requests)
[![dev dependencies](https://david-dm.org/klis87/redux-saga-requests/dev-status.svg?path=packages/redux-saga-requests)](https://david-dm.org/klis87/redux-saga-requests?path=packages/redux-saga-requests&type=dev)
[![peer dependencies](https://david-dm.org/klis87/redux-saga-requests/peer-status.svg?path=packages/redux-saga-requests)](https://david-dm.org/klis87/redux-saga-requests?path=packages/redux-saga-requests&type=peer)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Redux-Saga addon to simplify handling of AJAX requests. It supports Axios, Fetch API and GraphQL, but different
integrations could be added, as they are implemented in a plugin fashion.

## Table of content

- [Motivation](#motivation-arrow_up)
- [Installation](#installation-arrow_up)
- [Usage](#usage-arrow_up)
- [Actions](#actions-arrow_up)
- [Reducers](#reducers-arrow_up)
- [Selectors](#selectors-arrow_up)
- [Interceptors](#interceptors-arrow_up)
- [FSA](#fsa-arrow_up)
- [Promise middleware](#promise-middleware-arrow_up)
- [Cache middleware](#cache-middleware-arrow_up)
- [Usage with Fetch API](#usage-with-fetch-api-arrow_up)
- [Usage with GraphQL](#usage-with-graphql-arrow_up)
- [Mocking](#mocking-arrow_up)
- [Multiple drivers](#multiple-drivers-arrow_up)
- [React bindings](#react-bindings-arrow_up)
- [Server side rendering](#react-bindings-arrow_up)
- [Examples](#examples-arrow_up)

## Motivation [:arrow_up:](#table-of-content)

With `redux-saga-requests`, assuming you use `axios` you could refactor a code in the following way:
```diff
  import axios from 'axios';
- import { takeEvery, put, call } from 'redux-saga/effects';
+ import { createRequestInstance, watchRequests, requestsReducer } from 'redux-saga-requests';
+ import { createDriver } from 'redux-saga-requests-axios';

  const FETCH_BOOKS = 'FETCH_BOOKS';
- const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
- const FETCH_BOOKS_ERROR = 'FETCH_BOOKS_ERROR';

- const fetchBooks = () => ({ type: FETCH_BOOKS });
- const fetchBooksSuccess = data => ({ type: FETCH_BOOKS_SUCCESS, data });
- const fetchBooksError = error => ({ type: FETCH_BOOKS_ERROR, error });
+ const fetchBooks = () => ({
+   type: FETCH_BOOKS,
+   request: {
+     url: '/books',
+     // you can put here other Axios config attributes, like method, data, headers etc.
+   },
+ });

- const defaultState = {
-   data: null,
-   pending: 0, // number of pending FETCH_BOOKS requests
-   error: null,
- };
-
- const booksReducer = (state = defaultState, action) => {
-   switch (action.type) {
-     case FETCH_BOOKS:
-       return { ...defaultState, pending: state.pending + 1 };
-     case FETCH_BOOKS_SUCCESS:
-       return { ...defaultState, data: action.data, pending: state.pending - 1 };
-     case FETCH_BOOKS_ERROR:
-       return { ...defaultState, error: action.error, pending: state.pending - 1 };
-     default:
-       return state;
-   }
- };
+ const booksReducer = requestsReducer({ actionType: FETCH_BOOKS });

- const fetchBooksApi = () => axios.get('/books');
-
- function* fetchBooksSaga() {
-   try {
-     const response = yield call(fetchBooksApi);
-     yield put(fetchBooksSuccess(response.data));
-   } catch (e) {
-     yield put(fetchBooksError(e));
-   }
- }
-
  function* rootSaga() {
-   yield takeEvery(FETCH_BOOKS, fetchBooksSaga);
+   yield createRequestInstance({ driver: createDriver(axios) });
+   yield watchRequests();
  }
```
With `redux-saga-requests`, you no longer need to define error and success actions to do things like error handling
or showing loading spinners. You don't need to write requests related repetitive sagas and reducers either.

Here you can see the list of features this library provides:
- you define your AJAX requests as simple actions, like `{ type: FETCH_BOOKS, request: { url: '/books' } }` and `success`,
`error` (`abort` is also supported, see below) actions will be dispatched automatically for you
- `success`, `error` and `abort` functions, which add correct and consistent suffixes to your request action types
(check [low-level-reducers example](https://github.com/klis87/redux-saga-requests/tree/master/examples/low-level-reducers)
to see how to use those functions in your reducers)
- `requestsReducer` higher order reducer, which takes requests related state management burden from your shoulders
- automatic request abort - when a saga is cancelled, a request made by it is automatically aborted and an abort action
is dispatched (especially handy with `takeLatest` and `race` Redux-Saga effects)
- sending multiple requests in one action - `{ type: FETCH_BOOKS_AND_AUTHORS, request: [{ url: '/books' }, { url: '/authors}'] }`
will send two requests and wrap them in `Promise.all`
- flexibility - you can use "auto mode" `watchRequests`
(see [basic example](https://github.com/klis87/redux-saga-requests/tree/master/examples/basic)),
or lower level `sendRequest`
(see [advanced example](https://github.com/klis87/redux-saga-requests/tree/master/examples/advanced)),
or... you could even access your request instance with `getRequestInstance`
- support for Axios, Fetch API and GraphQL - additional clients could be added, you could even write your own client
integration as a `driver` (see [./packages/redux-saga-requests-axios/src/axios-driver.js](https://github.com/klis87/redux-saga-requests/blob/master/packages/redux-saga-requests-axios/src/axios-driver.js)
for the example)
- optimistic updates support, so your views can be updated even before requests are finished, while you still keep consistency in case of errors by reverting optimistic updates
- cache support with optional `requestsCacheMiddleware`
- mocking - mock driver, which use can use for test purposes or when you would like to integrate with API not yet implemented (and once API is finished, you could just change driver to Axios or Fetch and magicaly everything will work!)
- multiple driver support - for example you can use Axios for one part of your requests and Fetch Api for another part
- compatible with FSA, `redux-act` and `redux-actions` libraries (see [redux-act example](https://github.com/klis87/redux-saga-requests/tree/master/examples/redux-act-integration))
- simple to use with server side rendering - you can structure your code however you want and `countServerRequests` will let you
know when all requests are done on the server side and when you can render your app
- `onRequest`, `onSuccess`, `onError` and `onAbort` interceptors, you can attach your sagas (or simple functions)
to them to define a global behaviour for a given event type
- optional `requestsPromiseMiddleware`, which promisifies requests actions dispatch, so you can wait in your react components to get request response, the same way like you can do this with `redux-thunk`
- React bindings in `redux-saga-requests-react` package

## Installation [:arrow_up:](#table-of-content)

To install the package, just run:
```
$ yarn add redux-saga-requests
```
or...
```
$ npm install redux-saga-requests
```
or you can just use CDN: `https://unpkg.com/redux-saga-requests`.

Also, you need to install a driver:
- if you use Axios, install `axios` and `redux-saga-requests-axios`:

  ```
  $ yarn add axios redux-saga-requests-axios
  ```
  or...
  ```
  $ npm install axios redux-saga-requests-axios
  ```
  or CDN: `https://unpkg.com/redux-saga-requests-axios`.
- if you use Fetch API, install `isomorphic-fetch` (or a different Fetch polyfill) and `redux-saga-requests-fetch`:

  ```
  $ yarn add isomorphic-fetch redux-saga-requests-fetch
  ```
  or...
  ```
  $ npm install isomorphic-fetch redux-saga-requests-fetch
  ```
  or CDN: `https://unpkg.com/redux-saga-requests-fetch`.

Of course, because this is Redux-Saga addon, you also need to install `redux-saga`.
Also, it requires to install `reselect`.

## Usage [:arrow_up:](#table-of-content)

For a basic usage, see [Motivation](#motivation-arrow_up) paragraph.

### `watchRequests`

As you probably guessed, the most job is done by `watchRequests`, which is like a manager to your request actions - it sends
requests you define in your actions and dispatches success, error and abort actions, depending on the outcome. It can also
automatically abort requests. Aborting requests is a very important, but often neglected topic. Lets say you have a
paginated list and a user asked for 1st page, then 2nd and lets assume response for 1st one will come later. Or... lets say a private
data are being fetched and before this request is finished a user logged out. You could introduce many race condition bugs like
this, without even realizing - they won't happen on your local machine (without throthling in your browser), but they could happen
on a production system, especially on a slow mobile internet, with a high latency. Because aborting is so important, you can pass
a config to `watchRequests` to adjust, how different actions will be aborted. This config has following attributes:
- `abortOn: string | string[] | action => boolean`: allows you to define actions, on which requests should be aborted, has the
same form which you can pass to `redux-saga` `take` effect, for example `'LOGOUT'`, `['LOGOUT']`,
`action => action.type === 'LOGOUT'`, default is `null`
- `takeLatest: boolean | action => boolean`: if `true`, when a new request will be dispatched while a pending of the same type is still running,
the previous one will be automatically aborted, default is `true` for `GET` requests and `false` for the rest ones, or,
for GraphQL, `true` for queries and `false` for mutations
- `getLastActionKey: action => string`: a key generator to match actions of the same type, typically you won't need to adjust it,
but it might come in handy when you want some actions with the same `type` to be treated as a different one,
default is `action => action.type`.

So, for instance, you could do this:
```js
yield watchRequests({
  takeLatest: false,
  abortOn: 'LOGOUT',
});
```

Above defines a global behaviour, but what if you want to have different settings for different actions?
Just define `takeLatest` or `abortOn` in action `meta`, for example:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
  },
  meta: {
    takeLatest: false,
    abortOn: 'LOGOUT',
  },
});
```

Moreover, remember that `watchRequests` is a blocking effect, so if you have more sagas, use
`yield fork(watchRequests)`, or wrap it with something else in `all`:
```js
import { all, takeLatest, put } from 'redux-saga/effects';
import { createRequestInstance, watchRequests, success } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';

function* fetchBooksSuccessSaga() {
  yield put(addMessage('Books have been loaded');
}

function* rootSaga() {
  yield createRequestInstance({ driver: createDriver(axios) });
  yield all([
    // put it before other sagas which handle requests, otherwise watchRequests might miss some requests...
    // or your sagas might miss requests actions, like success
    watchRequests(),
    takeLatest(success('FETCH_BOOK'), fetchBooksSuccessSaga),
  ]);
}
```

Last, but not least, if for some reason you don't want your request action to be handled by `watchRequests`,
you can use `meta.runByWatcher`, like:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
  },
  meta: {
    runByWatcher: false,
  },
});
```

### `sendRequest`

Under the hood, `watchRequests` uses a lower level `sendRequest`. `watchRequests` should be flexible enough, so you won't need
to worry about `sendRequest`, but it is useful to know about it, it is handy in [Interceptors](#interceptors-arrow_up). Also, if you don't
like the magic of `watchRequests`, you might use it everywhere, or... you could write your own `watchRequests`! This is how it
works:
```js
import axios from 'axios';
import { takeLatest } from 'redux-saga/effects';
import { createRequestInstance, sendRequest } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios'; // or a different driver

const FETCH_BOOKS = 'FETCH_BOOKS';

const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books' },
});

function* rootSaga() {
  yield createRequestInstance({ driver: createDriver(axios) });
  yield takeLatest(FETCH_BOOKS, sendRequest);
}
```
Now, if `/books` request is pending and another `fetchBooks` action is triggered, the previous request will be aborted
and `FETCH_BOOKS_ABORT` will be dispatched.

You could also use `race` effect:
```js
import axios from 'axios';
import { call, race, take, takeLatest } from 'redux-saga/effects';
import { createRequestInstance, sendRequest } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios'; // or a different driver

const FETCH_BOOKS = 'FETCH_BOOKS';
const CANCEL_REQUEST = 'CANCEL_REQUEST';

const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books' },
});

const cancelRequest = () => ({ type: CANCEL_REQUEST });

function* fetchBookSaga(fetchBookAction) {
  yield race([
    call(sendRequest, fetchBookAction),
    take(CANCEL_REQUEST),
  ]);
}

function* rootSaga() {
  yield createRequestInstance({ driver: createDriver(axios) });
  yield takeLatest(FETCH_BOOKS, fetchBookSaga);
}
```
In above case, not only the last `/books` request could be successful, but also it could be aborted with `cancelRequest`
action, as `sendRequest` would be aborted as it would lose with `take(CANCEL_REQUEST)` effect.

Of course, you can send requests directly also from your sagas:
```js
function* fetchBookSaga() {
  const { response, error } = yield call(
    sendRequest,
    fetchBooks(),
    { dispatchRequestAction: true },
  );

  if (response) {
    // do sth with response
  } else {
    // do sth with error
  }
}
```
The key here is, that you need to pass `{ dispatchRequestAction: true }` as second argument to `sendRequest`, so that `fetchBooks` action will be
dispatched - usually it is already dispatched somewhere else (from your React components `onClick` for instance),
but here not, so we must explicitely tell `sendRequest` to dispatch it. Also, setting `dispatchRequestAction` as `true`
will set your request action meta `runByWatcher` as `false`, so if you happen to use `watchRequests`, you won't end up with
duplicated requests.

### `getRequestInstance`

Also, it is possible to get access to your request instance (like Axios) in your Saga:
```js
import { getRequestInstance } from 'redux-saga-requests';

function* fetchBookSaga() {
  const requestInstance = yield getRequestInstance();
  /* now you can do whatever you want, for example, if u use axios:
  const response = yield call(requestInstance.get, '/some-url') */
}
```
You can do whatever you want with it, which gives you maximum flexibility. Typically it is useful in [Interceptors](#interceptors-arrow_up),
when you want to make some request directly, without using redux action - for redux action you would use `sendRequest`.

## Actions [:arrow_up:](#table-of-content)

No matter whether you use `watchRequests` or `sendRequest`, you only need to define request actions, which will trigger AJAX
calls for you, as well as dispatch success, error or abort actions. Lets say you defined a following request
action:
```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: {
    url: `/books/${id}`,
    method: 'delete'
  },
  meta: { // meta is optional, it will be added to success, error or abort action when defined
    id,
  },
});
```

With this request action, assuming `id = 1`, following actions will be dispatched, depending on the request outcome:

### Successful response

```js
{
  type: 'DELETE_BOOK_SUCCESS',
  response: { data: 'some data' },
  data: 'some data',
  meta: {
    id: 1, // got from request action meta
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete'
      },
      meta: {
        id: 1,
      },
    },
  },
}
```

### Error response

```js
{
  type: 'DELETE_BOOK_ERROR',
  error: 'a server error',
  meta: {
    id: 1, // got from request action meta
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete'
      },
      meta: {
        id: 1,
      },
    },
  },
}
```

### Aborted request

```js
{
  type: 'DELETE_BOOK_ABORT',
  meta: {
    id: 1, // got from request action meta
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete'
      },
      meta: {
        id: 1,
      },
    },
  },
}
```

## Reducers [:arrow_up:](#table-of-content)

Except for `watchRequests` and `sendRequest`, which can simplify your actions and sagas a lot, you can also use
`requestsReducer` or `networkReducer`, higher order reducers, which are responsible for a portion of your state related to given requests.

### requestsReducer

For a general idea how it works, see [Motivation](#motivation-arrow_up) paragraph. This is just a minimal example, where with simple:
```javascript
const reducer = requestsReducer({ actionType: `FETCH_SOMETHING` });
```
you already have a working reducer which will handle `FETCH_SOMETHING`, `FETCH_SOMETHING_SUCCESS`,
`FETCH_SOMETHING_ERROR` and `FETCH_SOMETHING_ABORT` actions, updating a following state attributes for you:
- `data`: here a data from your API will be kept, updated after `FETCH_SOMETHING_SUCCESS` is dispatched, initially
set to `null` (default) or `[]`, depending on `multiple` config attribute (see below)
- `error`: initially `null`, updated to a HTTP error after `FETCH_SOMETHING_ERROR` is dispatched
- `pending`: number of pending `FETCH_SOMETHING` requests, initially `0`, incremented by `1` for each `FETCH_SOMETHING`,
and decremented by `1` for each of `FETCH_SOMETHING_SUCCESS`, `FETCH_SOMETHING_ERROR`, `FETCH_SOMETHING_ABORT`
(implemeted as `integer`, not `boolean` due to possibility of multiple pending requests of the same type -
for example in a sequence `FETCH_SOMETHING`, `FETCH_SOMETHING`, `FETCH_SOMETHING_SUCCESS` we would set `pending`
to `false`, despite the fact 2nd `FETCH_SOMETHING` is still running, with `integer` `pending` will be set to `1`,
which for example allows you to easily write a selector like `showSpinner = pending => pending > 0`)

In order to be flexible, apart from `actionType` passed in `requestsReducer` config, optionally you can pass any of
following attributes:
- `multiple: boolean`: default to `false`, change it to `true` if you want your not loaded data to be stored as `[]`
instead of `null`
- `getDefaultData: (multiple: boolean) => any`: use instead of `multiple`, if you want your initial data to be
something else than `null` or `[]`, for instance `() => ({ value: null })`, `multiple => (multiple ? [] : null)`
by default
- `getData: (state, action, config) => data`: describes how to get data from `action` object, by default returns `action.data` or `action.payload.data` when action is FSA compliant
- `updateData: (state, action, config) => data`: optional, useful together with operations to overwrite `getData` default, see more
information in `mutations`
- `getError: (state, action, config) => data`: describes how to get error from `action` object, by default returns `action.error` or `action.payload` when action is FSA compliant
- `onRequest: (state, action, config) => nextState`: here you can adjust how `requestReducers` handles request actions
- `onSuccess: (state, action, config) => nextState`: here you can adjust how `requestReducers` handles success actions
- `onError: (state, action, config) => nextState`: here you can adjust how `requestReducers` handles error actions
- `onAbort: (state, action, config) => nextState`: here you can adjust how `requestReducers` handles abort actions
- `resetOn: action => boolean or string[]`: callback or array of action types on which reducer will reset its state to initial one, for instance `['LOGOUT']` or `action => action.type === 'LOGOUT'`, `[]` by default
- `mutations`: optional object which you can use to map write actions like update/delete to `data` update, which also adds pending
state and errors for each defined mutation and allows optimistic updates, see more details below

For example:
```js
const reducer = requestsReducer({ actionType: `FETCH_SOMETHING`, multiple: true });
```
which will keep your empty data as `[]`, not `null`.

For inspiration how you could override any of those attributes, see default config
[source](https://github.com/klis87/redux-saga-requests/blob/master/packages/redux-saga-requests/src/reducers.js#L43).

You might also want to adjust any configuration for all your requests reducers globally. Here is how you can do this:
```js
import { requestsReducer } from 'redux-saga-requests';

const myRequestsReducer = config => requestsReducer({ multiple: true ...config });
```
Now, instead of built-in `requestsReducer`, you can use your own one, and from now on all reducers will have `multiple` set as `true` by default.

Another big feature of reducers are mutations. They allow you to add additional actions to update `data`, with extra
information kept in state useful to render button spinners or error messages. For example, lets say you have following request
actions:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: { url: '/books' },
})

const deleteAllBooks = () => ({
  type: 'DELETE_ALL_BOOKS',
  request: { url: '/books', method: 'delete' },
})
```

You can create a following reducer:
```js
const booksReducer = requestsReducer({
  actionType: 'FETCH_BOOKS',
  multiple: true,
  mutations: {
    DELETE_ALL_BOOKS: { updateData: (state, action) => [] } // or just (state, action) => []
  },
});
```
which will give you the following initial state:
```js
{
  data: [],
  error: null,
  pending: 0,
  mutations: {
    DELETE_ALL_BOOKS: {
      error: null,
      pending: 0,
    },
  },
};
```

Notice that `mutations` structure resembles the one from config we just passed, giving you
useful `error` and `pending` state per mutation. You can use them for example to show spinner or to disable `DELETE` button
or to show a request error. Also, after a successful delete mutation, `data` will be set to `[]` as defined in `updateData`.

It is also good to know, that you can set `updateData` to `false`, which would disable `data` manipulation and such a mutation
would be responsible only for `pending` and `error` state. Moreover, you can set `updateData` as `true`, which is useful to avoid
duplication, as often your server responses are the same for multiple mutations. Setting to `true` will fallback to top level
`updateData` defined in `requestsReducer` config, and if `updateData` is not defined, global `getData` will be used.

There is one more case to cover in mutations. Imagine we need another action:
```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: { url: `/book/${id}`, method: 'delete' },
})
```

Now, lets say we have a view with multiple books on one page and we want to show independent spinners for each
corresponding `DELETE` button. Can you see the problem? If we just add `DELETE_BOOK` operation like `DELETE_ALL_BOOKS`,
`pending` counter would be aggregated and all buttons would spin. We need to divide `DELETE_BOOK` per id, here is how we can
achieve this:
```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: { url: `/book/${id}`, method: 'delete' },
  meta: {
    id, // we will need this id in reducer
  },
})

const booksReducer = requestsReducer({
  actionType: 'FETCH_BOOKS',
  multiple: true,
  mutations: {
    DELETE_ALL_BOOKS: (state, action) => [],
    DELETE_BOOK: {
      updateData: (state, action) => state.data.filter(book => book.id !== action.meta.id),
      getRequestKey: requestAction => String(requestAction.meta.id), // you need to use string if id is an integer
    }
  }
});
```
which will give you the following initial state:
```js
{
  data: [],
  error: null,
  pending: 0,
  mutations: {
    DELETE_ALL_BOOKS: {
      error: null,
      pending: 0,
    },
    DELETE_BOOK: {},
  },
};
```
... and if a `deleteBook` with `id` `1` and `2` are running, state would be:
```js
{
  data: [],
  error: null,
  pending: 0,
  mutations: {
    DELETE_ALL_BOOKS: {
      error: null,
      pending: 0,
    },
    DELETE_BOOK: {
      1: {
        error: null,
        pending: 1,
      },
      2: {
        error: null,
        pending: 1,
      },
    },
  },
};
```

So, `DELETE_BOOK` state is one lever deeper, with state divided per `id`. Be careful though to always check whether
object with a given `id` exists before reading `pending` or `error` state, even after successful response, as
you will never see below state:
```js
DELETE_BOOK: {
  1: {
    error: null,
    pending: 0,
  },
  2: {
    error: null,
    pending: 0,
  },
},
```
as instead of resetting `pending` to `0`, a given object is just removed to release memory.

As a bonus, mutations come with optimistic updates support, so `data` can be updated even before requests are finished! Of course only if you can predict
server response. Let's update `DELETE_BOOK` mutation to support optimistic updates:
```js
const deleteBook = book => ({
  type: 'DELETE_BOOK',
  request: { url: `/book/${book.id}`, method: 'delete' },
  meta: {
    book, // we will need the whole book
  },
})

const booksReducer = requestsReducer({
  actionType: 'FETCH_BOOKS',
  multiple: true,
  mutations: {
    DELETE_ALL_BOOKS: (state, action) => [],
    DELETE_BOOK: {
      updateDataOptimistic: (state, action) => state.data.filter(book => book.id !== action.meta.book.id),
      revertData: (state, action) => [action.meta.book, ...state.data],
      getRequestKey: requestAction => String(requestAction.meta.book.id),
    }
  }
});
```
So what changed? We pass the whole `book` object, not only `id` to `deleteBook`, which is used in `revertData` later.
We replaced `updateData` with `updateDataOptimistic`, which updates `data` immediately after `DELETE_BOOK` request
is fired, so even if this request was slow, your view would be updated at once anyway! What in case of errors though?
We need to revert the state by putting the cancelled book back to `data` array. So, in case of an error, `DELETE_BOOK_ERROR`
would be dispatched and `revertData` would be called. Optionally, it is possible to define `updateData` next to
`updateDataOptimistic`, for example to replace a mocked id generated during an optimistic insert action with a server id. Also,
note that `revertData` would be also called for aborted requests, like `DELETE_BOOK_ABORT` in our example. Usually you won't get
aborted operations though, unless you use `takeLatest: true` for an operation. This is not recommended to use together with
optimistic update though, because for an aborted request there is no way to tell whether an operation succedded or not, so
it is impossible to tell whether we should revert or not.

Also, sometimes you might have a situation which requires to update `data` with a local action, not a remote mutation.
For this, you can use a local mutation, for instance:
```js
const deleteAllBooks = () => ({ type: 'DELETE_ALL_BOOKS' });

const booksReducer = requestsReducer({
  actionType: 'FETCH_BOOKS',
  multiple: true,
  mutations: {
    DELETE_ALL_BOOKS: {
      updateData: (state, action) => [],
      local: true,
    },
  },
});
```

### networkReducer

This is a manager of `requestsReducer` instances, so you don't need to write reducers for your remote state anymore!
It is recent additional to this library, but it is the recommended way to use it and probably `requestsReducer` will be removed
from public API. The difference is that you define only one `networkReducer` and config you used in `requestsReducer` now
you need to move to action.meta. Also, because all remote state is kept in standardized form, not only you don't need to write
reducers for remote data, but selectors also become redundant! Just use `getQuery`, `getMutation` and React helpers is you use
React.

So how does it work? Before going into that, lets divide all requests into queries and mutations. Queries have `data`, while mutations
can change it. By default, for REST drivers queries are requests with `GET` method, the rest are mutations. For graphql... not by coincidence... queries are queries and mutations are mutations. Actually this division is taken from graphql naming convention.

This division is necessary because `networkReducer` needs to know whether request is a query or a mutation, because it handles
them differently. You can adjust this distinction by providing `isRequestActionQuery` to `networkReducer`. Also, if the default behaviour
is good for your use case, but sometimes you have an exception, you can use `action.meta.asMutation` `true` or `false`, for instance:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: { url: '/books' },
  meta: { asMutation: true },
})
```
Above action will be treated as mutation, not query.

So how to use `networkReducer`? Just put it as `network` key in your top reducer:
```js
import { combineReducers } from 'redux';
import { networkReducer } from 'redux-saga-requests';

const reducer = combineReducers({
  network: networkReducer({
    // isRequestActionQuery
    // getData,
    // updateData,
    // getError,
    // onRequest,
    // onSuccess,
    // onError,
    // onAbort,
    // resetOn,
  })
})
```
Above you can see additional optional settings which it supports, they work the same
as in `requestsReducer` and actually here you can just provide defaults for dynamically created
`requestsReducer` instances. Remember you still could override them in action.meta.

`networkReducer` default state is `{ queries: {}, mutations: {} }` and it reacts on requests actions.
For example when you dispatch:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: { url: '/books' },
})
```
the state will be updated to:
```js
{
  queries: {
    FETCH_BOOKS: {
      data: null,
      pending: 1,
      error: null,
    },
  },
  mutations: {},
}
```
As you can see, it groups your remote state by queries and mutations, and those by action types.
The rest works the same as with `requestsReducer`.

Now, for queries you can use `resetOn`, `getData`, `updateData`, `getError` in the same way you did for `requestsReducer`, just put them in action.meta.
Notice that `actionType` does not make sense as `action.type` defines it. Also, `multiple` and `getDefaultData` also cannot be supported
as it could be used only after an initial dispatch of a query. You would get inconsistent results then. That's why it is
recommented to use `getQuery` and `getMutation` selectors. Regarding mutations, you need to revert the way it worked in `requestsReducer`.
There you defined all possible mutations inside `requestsReducer` config, so mutations where coupled with queries. With `networkReducer`
you put mutation config inside action.meta of mutation actions. For example:
```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  meta: {
    id,
    mutations: {
      getRequestKey: requestAction => String(requestAction.meta.book.id),
      FETCH_BOOKS: {
        updateDataOptimistic: (state, action) => state.data.filter(book => book.id !== action.meta.book.id),
        revertData: (state, action) => [action.meta.book, ...state.data],
      },
    },
  },
});
```
So, it is similar, but now keys inside mutations are actually queries types. Also, `getRequestKey`
goes directly into `mutation`. Additional change compared to `requestsReducer` is that
all mutations state is handled, so you don't need to do things like `updateData: false`.

### Custom reducers
Of course can write your reducers in a standard way too, but you might consider using `success`, `error` and `abort` helpers, which can add proper suffixes for you:
```js
import { success, error, abort } from 'redux-saga-requests';

const initialState = {
  data: null,
  fetching: false,
  error: false,
};

const FETCH_BOOKS = 'FETCH_BOOKS';

const booksReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BOOKS:
      return { ...initialState, fetching: true };
    case success(FETCH_BOOKS):
      return {
        ...initialState,
        data: { ...action.data },
      };
    case error(FETCH_BOOKS):
      return { ...initialState, error: true };
    case abort(FETCH_BOOKS):
      return { ...initialState, fetching: false };
    default:
      return state;
  }
};
```

## Selectors [:arrow_up:](#table-of-content)

### getQuery

`getQuery` returns `reselect` selector, which gets a query state from Redux store with
converted `pending` key into `boolean` `loading` as `loading: pending > 0` for convenience.
Returned selector also returns fallback query when it does not exist yet in your reducer as
`{ data: null, error: null, loading: false }` so you always have the same object
structure. Because it uses `reselect`, it is friendly
with `React` `memo`/`PureComponent` optimisations. To use it, pass object as argument
with the following keys:
- `type: string`: just pass action type or action itself when using action creator library, possible only when using `networkReducer`,
- `requestSelector`: for instance `state => state.request`, use only when you use `requestsReducer`
- `multiple`: set to `true` if you prefer `data` to be `[]` instead of `null`, `false` by default
- `defaultData`: use it to represent `data` as an orbitrary object instead of `null`

For example:
```js
import { getQuery } from 'redux-saga-requests';

// when using networkReducer
const querySelector = getQuery({ type: QUERY_TYPE });

// when using requestsReducer
const querySelector = getQuery({ requestSelector: state => state.request });

const queryState = querySelector(state);
```

### `getMutation`

`getMutation` returns `reselect` selector, which gets a mutation state from Redux store and converts `pending` key into `boolean` `loading` as `loading: pending > 0` for convenience. Returned selector also returns fallback mutation when it does not exist yet in your reducer as
`{ error: null, loading: false }` so you always have the same object structure.
To use it, pass object as argument with one of the following keys:
- `type: string`: just pass action type or action itself when using action creator library
- `requestSelector`: only when using `requestsReducer`, for instance `state => state.request`, the same as in `getQuery`
- `requestKey: string`: only necessary if you defined `getRequestKey` in a mutation,
usually it will be some kind of id

For example:
```js
import { getMutation } from 'redux-saga-requests';

// when using networkReducer
const mutationSelector = getMutation({ type: MUTATION_TYPE });

// when using networkReducer and getRequestKey
const mutationSelector = getMutation({ type: MUTATION_TYPE, requestKey: '1' });

// when using requestsReducer
const mutationSelector = getMutation({
  type: MUTATION_TYPE,
  requestSelector: state => state.request,
});

const mutationState = mutationSelector(state);
```

## Interceptors [:arrow_up:](#table-of-content)

You can add global handlers to `onRequest`, `onSuccess`, `onError` add `onAbort`, like so:
```js
import { sendRequest, getRequestInstance } from 'redux-saga-requests';

function* onRequestSaga(request, action) {
  // do sth with you request, like add token to header, or dispatch some action etc.
  return request;
}

function* onSuccessSaga(response, action) {
  // do sth with the response, dispatch some action etc
  return response;
}

function* onErrorSaga(error, action) {
  // do sth here, like dispatch some action

  // you must return { error } in case you dont want to catch error
  // or { error: anotherError }
  // or { response: someRequestResponse } if you want to recover from error

  if (tokenExpired(error)) {
    // get driver instance, in our case Axios to make a request without Redux
    const requestInstance = yield getRequestInstance();

    try {
      // trying to get a new token
      const { data } = yield call(
        requestInstance.post,
        '/refreshToken',
      );

      saveNewToken(data.token); // for example to localStorage

      // we fire the same request again:
      // - with silent: true not to dispatch duplicated actions
      return yield call(sendRequest, action, { silent: true });

      /* above is a handy shortcut of doing
      const { response, error } = yield call(
        sendRequest,
        action,
        { silent: true },
      );

      if (response) {
        return { response };
      } else {
        return { error };
      } */
    } catch(e) {
      // we didnt manage to get a new token
      return { error: e }
    }
  }

  // not related token error, we pass it like nothing happened
  return { error };
}

function* onAbortSaga(action) {
  // do sth, for example an action dispatch
}

function* rootSaga() {
  yield createRequestInstance({
    driver: createDriver(axios),
    onRequest: onRequestSaga,
    onSuccess: onSuccessSaga,
    onError: onErrorSaga,
    onAbort: onAbortSaga,
  });
  yield watchRequest();
}
```

If you need to use `sendRequest` in an interceptor, be aware of an additional options you
can pass to it:
```js
  yield call(sendRequest, action, {
    silent: true,
    runOnRequest: false,
    runOnSuccess: false,
    runOnError: false,
    runOnAbort: false,
});
```
Generally, use `silent` if you don't want to dispatch actions for a given request.
The rest options is to disable given interceptors for a given request. By default `silent` is `false`,
which simply means that `sendRequests` will dispatch Redux actions. The rest is slightly more dynamic:
- if a request is sent by `watchRequests` or a `sendRequests` not from an interceptor, all interceptors
will be run
- if you use `sendRequest` in `onRequest` interceptor, `runOnRequest` is set to `false`
- if you use `sendRequest` in `onSuccess` interceptor, `runOnSuccess` and `runOnError` are set to `false`
- if you use `sendRequest` in `onError` interceptor, `runOnError` is set to `false`
- if you use `sendRequest` in `onAbort` interceptor, `runOnAbort` is set to `false`

Those defaults are set to meet most use cases without the need to worry about disabling proper interceptors manually.
For example, if you use `sendRequest` in `onRequest` interceptor, you might end up with inifinite loop when `runOnRequest` was true.
If your use case vary though, you can always overwrite this behaviour by `runOn...` options.

## FSA [:arrow_up:](#table-of-content)

If you like your actions to be compatible with
[Flux Standard Action](https://github.com/acdlite/flux-standard-action#flux-standard-action),
that's totally fine, you can define your request actions like:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  payload: {
    request: {
      url: '/books',
    },
  },
  meta: { // optional
    someKey: 'someValue',
  },
});
```
Then, success, error and abort actions will also be FSA compliant. Moreover, `requestsReducer` will also correctly handle FSA actions.
For details, see [redux-act example](https://github.com/klis87/redux-saga-requests/tree/master/examples/redux-act-integration).

## Promise middleware [:arrow_up:](#table-of-content)

One disadvantage of using sagas is that there is no way to dispatch an action which triggers a saga from React component and
wait for this saga to complete. Because of this, integration with libraries like `Formik` are sometimes harder - for example you
are forced to push some callbacks to Redux actions for a saga to execute later, which is not convenient. Thats why this library gives
an optional `requestsPromiseMiddleware`:
```js
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { requestsPromiseMiddleware } from 'redux-saga-requests';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  app,
  applyMiddleware(requestsPromiseMiddleware(), sagaMiddleware),
);
```

Now, lets say you defined an action:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books'},
  meta: {
    asPromise: true,
  },
});
```

You can dispatch the action from a component and wait for a response:
```js
class Books extends Component {
  fetch = () => {
    this.props.fetchBooks().then(successAction => {
      // handle successful response
    }).catch(errorOrAbortAction => {
      // handle error or aborted request
    })
  }

  render() {
    // ...
  }
}
```

Also, you can pass an optional `auto` flag to `requestsPromiseMiddleware`:
```js
requestsPromiseMiddleware({
  auto: true // if you with to promisify all request actions without explicit meta.asPromise true
})
```
Note auto mode `true` will NOT promisify action with explicit `meta.asPromise: false`.

## Cache middleware [:arrow_up:](#table-of-content)

Sometimes you might want your responses to be cached for an amount of time or even forever (until the page is not reloaded at least).
Or, putting it another way, you would like to send a given request no more often than once for an amount of time. You can easily
achieve it with an optional `requestsCacheMiddleware`:
```js
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { requestsCacheMiddleware } from 'redux-saga-requests';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  app,
  applyMiddleware(requestsCacheMiddleware(), sagaMiddleware),
);
```
... or together with `requestsPromiseMiddleware`:
```js
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { requestsCacheMiddleware, requestsPromiseMiddleware } from 'redux-saga-requests';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  app,
  applyMiddleware(
    requestsCacheMiddleware(), // put before requestsPromiseMiddleware
    requestsPromiseMiddleware(),
    sagaMiddleware,
  ),
);
```

After this setup, you can use `meta.cache`:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books'},
  meta: {
    cache: 10, // in seconds
  },
});
```

What will happen now, is that after a succesfull book fetch (to be specific after `FETCH_BOOKS_SUCCESS` is dispatched),
any `FETCH_BOOKS` actions for `10` seconds won't trigger any AJAX calls and the following `FETCH_BOOKS_SUCCESS` will contain
cached previous server response. You could also use `cache: true` to cache forever.

Another use case is that you might want to keep a separate cache for the same request action based on a cache key. For example:
```js
const fetchBook = id => ({
  type: FETCH_BOOK,
  request: { url: `/books/${id}`},
  meta: {
    cache: true,
    cacheKey: id // must be string
  },
});

/* then, you will achieve the following behaviour:
- GET /books/1 - make request
- GET /books/1 - cache hit
- GET /books/1 - cache hit
- GET /books/2 - make request
- GET /books/2 - cache hit
- GET /books/1 - cache hit
*/
```

The only problem with above is that if you happen to request with too many different cache keys,
then cache would take too much memory. The remedy to this problem is `cacheSize`:
```js
const fetchBook = id => ({
  type: FETCH_BOOK,
  request: { url: `/books/${id}`},
  meta: {
    cache: true,
    cacheKey: id // must be string
    cacheSize: 2 // any integer bigger or equal 1
  },
});

/* then, you will achieve the following behaviour:
- GET /books/1 - make request
- GET /books/1 - cache hit
- GET /books/1 - cache hit
- GET /books/2 - make request
- GET /books/2 - cache hit
- GET /books/1 - cache hit
- GET /books/3 - make request
- GET /books/3 - cache hit
- GET /books/2 - cache hit
- GET /books/1 - make request! because /books/3 invalidated /books/1 as
it was the oldest cache and our cache size was set to 2
*/
```

If you need to clear the cache for some reason, you can use `clearRequestsCache` action:
```js
import { put } from 'redux-saga/effects';
import { clearRequestsCache } from 'redux-saga-requests';

function* cacheSaga() {
  yield put(clearRequestsCache()) // clear the whole cache
  yield put(clearRequestsCache(FETCH_BOOKS)) // clear only FETCH_BOOKS cache
  yield put(clearRequestsCache(FETCH_BOOKS, FETCH_AUTHORS)) // clear only FETCH_BOOKS and FETCH_AUTHORS cache
}
```

Additionally, you can use `getRequestCache` action for debugging purposes:
```js
import { put } from 'redux-saga/effects';
import { getRequestCache } from 'redux-saga-requests';

function* cacheSaga() {
  const currentCache = yield put(getRequestCache());
}
```


## Usage with Fetch API [:arrow_up:](#table-of-content)

All of the above examples show Axios usage, in order to use Fetch API, use below snippet:
```js
import 'isomorphic-fetch'; // or a different fetch polyfill
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-fetch';

function* rootSaga() {
  yield createRequestInstance({
    driver: createDriver(
      window.fetch,
      {
        baseURL: 'https://my-domain.com' // optional - it works like axios baseURL, prepending all relative urls
        AbortController: window.AbortController, // optional, if your browser supports AbortController or you use a polyfill like https://github.com/mo/abortcontroller-polyfill
      }
    ),
  });
  yield watchRequests();
}
```
And in order to create Fetch API requests, below:
```js
fetch('/users', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
});
```
should be translated to this:
```javascript
const fetchUsers = () => ({
  type: 'FETCH_USERS',
  request: {
    url: '/users/',
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }
});
```
The point is, you can use the same request config like you do with pure Fetch API, but you need to pass `url` in the
config itself. Also, one additional parameter you could provide in the config is `responseType`, which is set as `json`
as the default. Available response types are: `'arraybuffer'`, `'blob'`, `'formData'`, `'json'`, `'text'`, or `null`
(if you don't want a response stream to be read for the given response).

Also, this driver reads response streams automatically for you (depending on `responseType` you choose)
and sets it as `response.data`, so instead of doing `response.json()`, just read `response.data`.

## Usage with GraphQL [:arrow_up:](#table-of-content)

Just install `redux-saga-requests-graphql` driver. See
[docs](https://github.com/klis87/redux-saga-requests/tree/master/packages/redux-saga-requests-graphql)
for more info.

## Mocking [:arrow_up:](#table-of-content)

Probably you are sometimes in a situation when you would like to start working on a feature which needs some integration with
an API. What you can do then? Probably you just wait or start writing some prototype which then you will polish once API is finished. You can do better with `redux-saga-requests-mock`, especially with multi driver support, which you can read about in the
next paragraph. With this driver, you can define expected responses and errors which you would get from server and write your app
normally. Then, after API is finished, you will just need to replace the driver with a real one, like Axios or Fetch API, without
any additional refactoring necessary, which could save you a lot of time!

You can use it like this:
```js
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-mock';

const FETCH_PHOTO = 'FETCH_PHOTO';

const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

function* rootSaga() {
  yield createRequestInstance({
    driver: createDriver(
      {
        [FETCH_PHOTO]: (requestConfig, requestAction) => {
          // mock normal response for id 1 and 404 error fot the rest
          const id = requestConfig.url.split('/')[2];

          if (id === '1') {
            return {
              data: {
                albumId: 1,
                id: 1,
                title: 'accusamus beatae ad facilis cum similique qui sunt',
              },
            };
          }

          throw { status: 404 };
        },
      },
      {
        timeout: 1000, // optional, in ms, defining how much time mock request would take, useful for testing spinners
        getDataFromResponse: response => response.data // optional, if you mock Axios or Fetch API, you dont need to worry about it
      },
    ),
  });
  yield watchRequests();
}
```

## Multiple drivers [:arrow_up:](#table-of-content)

You can use multiple drivers if you need it. For example, if you want to use Axios by default, but also Fetch API
sometimes, you can do it like this:
```js
import axios from 'axios';
import 'isomorphic-fetch';
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver as createAxiosDriver } from 'redux-saga-requests-axios';
import { createDriver as createFetchDriver } from 'redux-saga-requests-fetch';

function* rootSaga() {
  yield createRequestInstance({
    driver: {
      default: createAxiosDriver(axios),
      fetch: createFetchDriver(
        window.fetch,
        {
          baseURL: 'https://my-domain.com',
          AbortController: window.AbortController,
        },
      ),
    },
  });
  yield watchRequests();
}
```

As you can see, the default driver is Axios, so how to mark a request to be run by Fetch driver?
Just pass the key you assigned Fetch driver to (`fetch` in our case) in `action.meta.driver`, for instance:
```js
const fetchUsers = () => ({
  type: 'FETCH_USERS',
  request: {
    url: '/users/',
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  },
  meta: {
    driver: 'fetch',
  },
});
```

Also, if you want to use `getRequestInstance` with Fetch driver, just pass a proper driver key to it:
```js
import { getRequestInstance } from 'redux-saga-requests';

function* fetchBookSaga() {
  const requestInstance = yield getRequestInstance('fetch');
}
```

## React bindings [:arrow_up:](#table-of-content)

Just install `redux-saga-requests-react`. See
[docs](https://github.com/klis87/redux-saga-requests/tree/master/packages/redux-saga-requests-react)
for more info.

## Server side rendering [:arrow_up:](#table-of-content)

Server side rendering is a very complex topic and there are many ways how to go about it.
Many people use the strategy around React components, for instance they attach static methods to components which
make requests and return promises with responses, then they wrap them in `Promise.all`. I don't recommend this strategy
when using Redux, because this requires additional code and potentially double rendering on server, but if you really want
to do it, it is possible. Normally it wouldn't be possible with Redux-Saga, but thanks to `requestsPromiseMiddleware`, dispatched
request actions return promises, just like with `redux-thunk`.

However, I recommend using another approach. See [server-side-rendering-example](https://github.com/klis87/redux-saga-requests/tree/master/examples/server-side-rendering) with the complete setup, but in a nutshell you can write universal code like you would
normally write it without SSR, with just only minor additions. Here is how:

1. Before we begin, be advised that this strategy requires to dispatch requests on Redux level, at least those which have to be
fired on application load. So for instance you cannot dispatch them inside `componentDidMount`. The obvious place to dispatch them
is in your sagas, like `yield put(fetchBooks())`. However, what if your app has multiple routes, and each route has to send
different requests? Well, you need to make Redux aware of current route. I recommend to use a router with first class support for
Redux, namely [redux-first-router](https://github.com/faceyspacey/redux-first-router). If you use `react-router` though, it is
fine too, you just need to integrate it with Redux with
[connected-react-router](https://github.com/supasate/connected-react-router). Then, you can use `take` effect to listen to
routes changes and/or get current location with `select` effect. This would give you information which route is active to know
which requests to dispatch.
2. On the server use `countServerRequests`, which keeps track of all your requests and will let you know when all requests
are finished. Here you can see a possible implementation:
    ```js
    import { createStore, applyMiddleware, combineReducers } from 'redux';
    import createSagaMiddleware from 'redux-saga';
    import { all, put, call } from 'redux-saga/effects';
    import axios from 'axios';
    import {
      createRequestInstance,
      watchRequests,
      countServerRequests,
      serverRequestsFilterMiddleware,
    } from 'redux-saga-requests';
    import { createDriver } from 'redux-saga-requests-axios';

    import { booksReducer } from './reducers';
    import { fetchBooks } from './actions';

    function* bookSaga() {
      yield put(fetchBooks());
    }

    function* rootSaga(ssr = false, serverRequestActions) {
      yield createRequestInstance({
        driver: createDriver(
          axios.create({
            baseURL: 'http://localhost:3000',
          }),
        ),
      });

      yield all(
        [
          ssr && call(countServerRequests, {
            serverRequestActions
            finishOnFirstError: true // default, you can change it to false
          }),
          call(watchRequests),
          call(bookSaga),
        ].filter(Boolean),
      );
    }

    export const configureStore = (initialState = undefined) => {
      const ssr = !initialState; // if initiaState is not passed, it means we run it on server
      const reducers = combineReducers({
        books: booksReducer,
      });

      const sagaMiddleware = createSagaMiddleware();

      const middlewares = [
        !ssr &&
          serverRequestsFilterMiddleware({
            serverRequestActions: window.__SERVER_REQUEST_ACTIONS__,
          }),
        sagaMiddleware,
      ].filter(Boolean);

      const store = createStore(
        reducers,
        initialState,
        applyMiddleware(...middlewares),
      );

      store.runSaga = serverRequestActions =>
        sagaMiddleware.run(rootSaga, ssr, serverRequestActions);
      return store;
    };

    // on the server
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { Provider } from 'react-redux';

    // in an express/other server handler
    const store = configureStore();
    const serverRequestActions = {};
    store
      .runSaga(serverRequestActions)
      .toPromise().then(() => { // done instead of toPromise() if you use redux-saga older than 1.0.0
        if (serverRequestActions.errorActions.length > 0) {
          res.status(400).send('something went wrong');
        } else {
          const html = renderToString(
            <Provider store={store}>
              <App />
            </Provider>,
          );

          res.render('index', {
            html,
            initialState: JSON.stringify(store.getState()),
            serverRequestActions: JSON.stringify(
              serverRequestActions.requestActionsToIgnore,
            ),
          });
        }
      })
    ```
    As you can see, you only need to use `countServerRequests`, which will let you know
    when you are ready to render plus it will give you information about any errors which could happen
    during requests by mutating `serverRequestActions` you pass to it.

    How does it work? `countServerRequests` logic is based on an internal counter. Initially it is set to `0` and is
    increased by `1` after each request is initialized. Then, after each response it is decreased by `1`. So, initially after a first
    request it gets positive and after all requests are finished, its value is again set back to `0`. And this is the moment
    which means that all requests are finished. To make this notification, `countServerRequests` dispatches a special
    action from `redux-saga`, namely `END`, which stops all your sagas. After your sagas are stopped,
    `store.runSaga(serverRequestActions).done` promise is resolved. Then, it is time to inspect `serverRequestActions`, but before
    we go into that, lets cover three edge cases.

    One scenario you could be worried with above algorythm is what to do in case of an error. Obviously errors can
    always happen for network call and actually by default `contServerRequest` dispatches `END` no matter what counter is
    on any first encountered error response. You can change this behaviour by option `finishOnFirstError: false` to it.

    Another problem you might think of is what to do if you don't want to dispatch any request for a given route?
    Then counter would never be increased, so it would also never be decreased, so `countServerRequests` would never
    dispatch `END`. How to fix this? Simple, if you know there is no request, just dispatch `END` yourself!
    Just `import { END } from 'redux-saga'` and `yield put(END)`

    There is also more complex case. Imagine you have a request `x`, after which you would like to dispatch
    another `y`. You cannot do it immediately because `y` requires some information from `x` response.
    Above algorythm would not wait for `y` to be finished, because on `x` response counter would be
    already reset to `0`. There are two `action.meta` attributes to help here:
    - `dependentRequestsNumber` - a positive integer, a number of requests which will be fired after this one,
    in above example we would put `dependentRequestsNumber: 1` to `x` action, because only `y` depends on `x`
    - `isDependentRequest` - mark a request as `isDependentRequest: true` when it depends on another request,
    in our example we would put `isDependentRequest: true` to `y`, because it depends on `x`

    You could even have a more complicated situation, in which you would need to dispatch `z` after `y`. Then
    you would also add `dependentRequestsNumber: 1` to `y` and `isDependentRequest: true` to `z`. Yes, a request
    can have both of those attibutes at the same time! Anyway, how does it work? Easy, just a request with
    `dependentRequestsNumber: 2` would increase counter by `3` on request and decrease by `1` on response,
    while an action with `isDependentRequest: true` would increase counter on request by `1` as usual but decrease
    it on response by `2`. So, the counter will be reset to `0` after all requests are finished, also dependent ones.

    Going back to `serverRequestActions` object, it has the following properties:
    - `successActions` - array of `success` actions that were dispatched, exluding dependent actions
    - `dependentSuccessActions` - array `success` actions that were dispatched with `meta.isDependentRequest: true`
    - `errorActions` - array of `error` actions if there was an error request
    - `requestActionsToIgnore` - actions you should pass to client during SSR, actually this is
    just array of requests actions with just `type` got from `successActions` (to decrease payload size
    sent to the client side)

3. The last thing you need to do is to use `serverRequestsFilterMiddleware` on the client side,
like in the snippet from step `2`. What does it do? Well, it will ignore request actions which match
those already dispatched during SSR. Why? Because otherwise with universal code the same job done on the server
would be repeated on the client. If you think about it, that is also the reason why `requestActionsToIgnore`
don't include `dependentSuccessActions`. Dependent request actions won't be dispatched on the client side,
because request they depend on also won't be dispatched. One thing worth mentioning here is that
`sendRequest` for ignored request won't return object with `response` or `error` key, but `{ serverSide: true }`.
One last thing, put `serverRequestsFilterMiddleware` before promise and cache middlewares if you happen to use those.

## Examples [:arrow_up:](#table-of-content)

I highly recommend to try examples how this package could be used in real applications. You could play with those demos
and see what actions are being sent with [redux-devtools](https://github.com/zalmoxisus/redux-devtools-extension).

There are following examples currently:
- [basic](https://github.com/klis87/redux-saga-requests/tree/master/examples/basic)
- [advanced](https://github.com/klis87/redux-saga-requests/tree/master/examples/advanced)
- [mutations](https://github.com/klis87/redux-saga-requests/tree/master/examples/mutations)
- [mutations with requests reducers](https://github.com/klis87/redux-saga-requests/tree/master/examples/mutations-with-requests-reducers)
- [Fetch API](https://github.com/klis87/redux-saga-requests/tree/master/examples/fetch-api)
- [GraphQL](https://github.com/klis87/redux-saga-requests/tree/master/examples/graphql)
- [redux-act integration](https://github.com/klis87/redux-saga-requests/tree/master/examples/redux-act-integration)
- [low-level-reducers](https://github.com/klis87/redux-saga-requests/tree/master/examples/low-level-reducers)
- [mock-and-multiple-drivers](https://github.com/klis87/redux-saga-requests/tree/master/examples/mock-and-multiple-drivers)
- [server-side-rendering](https://github.com/klis87/redux-saga-requests/tree/master/examples/server-side-rendering)

## Credits [:arrow_up:](#table-of-content)

This library was inspired by [redux-axios-middleware](https://github.com/svrcekmichal/redux-axios-middleware)
(I highly recommend this library if someone doesn't use Redux-Saga!)
and [issue](https://github.com/redux-saga/redux-saga/issues/1117) in Redux-Saga, when it was recommended not to combine
another async middleware with sagas.

## Licence [:arrow_up:](#table-of-content)

MIT
