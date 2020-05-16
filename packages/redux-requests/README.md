# redux-requests

[![npm version](https://badge.fury.io/js/%40redux-requests%2Fcore.svg)](https://badge.fury.io/js/%40redux-requests%2Fcore)
[![gzip size](http://img.badgesize.io/https://unpkg.com/redux-saga-requests/dist/redux-saga-requests.min.js?compression=gzip)](https://unpkg.com/redux-saga-requests)
[![dependencies](https://david-dm.org/klis87/redux-saga-requests.svg?path=packages/redux-saga-requests)](https://david-dm.org/klis87/redux-saga-requests?path=packages/redux-saga-requests)
[![dev dependencies](https://david-dm.org/klis87/redux-saga-requests/dev-status.svg?path=packages/redux-saga-requests)](https://david-dm.org/klis87/redux-saga-requests?path=packages/redux-saga-requests&type=dev)
[![peer dependencies](https://david-dm.org/klis87/redux-saga-requests/peer-status.svg?path=packages/redux-saga-requests)](https://david-dm.org/klis87/redux-saga-requests?path=packages/redux-saga-requests&type=peer)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Redux addon to simplify handling of AJAX requests. It supports Axios, Fetch API, GraphQL and promise based API libraries,
but different integrations could be added, as they are implemented in a plugin fashion.

## Table of content

- [Motivation](#motivation-arrow_up)
- [Installation](#installation-arrow_up)
- [Usage](#usage-arrow_up)
- [Actions](#actions-arrow_up)
- [Selectors](#selectors-arrow_up)
- [Reducers](#reducers-arrow_up)
- [Middleware](#middleware-arrow_up)
- [handleRequests](#handleRequests-arrow_up)
- [Interceptors](#interceptors-arrow_up)
- [FSA](#fsa-arrow_up)
- [Usage with Fetch API](#usage-with-fetch-api-arrow_up)
- [Usage with GraphQL](#usage-with-graphql-arrow_up)
- [Usage with promise based API libraries](#usage-with-promise-based-api-libraries-arrow_up)
- [Mocking](#mocking-arrow_up)
- [Multiple drivers](#multiple-drivers-arrow_up)
- [Normalisation](#normalisation-arrow_up)
- [React bindings](#react-bindings-arrow_up)
- [Examples](#examples-arrow_up)

## Motivation [:arrow_up:](#table-of-content)

With `redux-requests`, assuming you use `axios` you could refactor a code in the following way:
```diff
  import axios from 'axios';
- import thunk from 'redux-thunk';
+ import { handleRequests } from '@redux-requests/core';
+ import { createDriver } from '@redux-requests/axios'; // or another driver

  const FETCH_BOOKS = 'FETCH_BOOKS';
- const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
- const FETCH_BOOKS_ERROR = 'FETCH_BOOKS_ERROR';
-
- const fetchBooksRequest = () => ({ type: FETCH_BOOKS });
- const fetchBooksSuccess = data => ({ type: FETCH_BOOKS_SUCCESS, data });
- const fetchBooksError = error => ({ type: FETCH_BOOKS_ERROR, error });

- const fetchBooks = () => dispatch => {
-   dispatch(fetchBooksRequest());
-
-   return axios.get('/books').then(response => {
-     dispatch(fetchBooksSuccess(response.data));
-     return response;
-   }).catch(error => {
-     dispatch(fetchBooksError(error));
-     throw error;
-   });
- }

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

  const configureStore = () => {
+   const { requestsReducer, requestsMiddleware } = handleRequests({
+     driver: createDriver(axios),
+   });
+
    const reducers = combineReducers({
-     books: booksReducer,
+     requests: requestsReducer,
    });

    const store = createStore(
      reducers,
-     applyMiddleware(thunk),
+     applyMiddleware(...requestsMiddleware),
    );

    return store;
  };
```
With `redux-requests`, you no longer need to define error and success actions to do things like error handling
or showing loading spinners. You don't need to write requests response related repetitive actions and reducers either.
You don't even need to worry about writing selectors, as this library provides optimized selectors out of the box.
With action helper library like `redux-actions`, you don't even need to write constants!
So basically you end up writing just actions to manage your whole remote state, so no more famous boilerplate in your Redux apps!

Here you can see the list of features this library provides:
- you define your AJAX requests as simple actions, like `{ type: FETCH_BOOKS, request: { url: '/books' } }` and `success`,
`error` (`abort` is also supported, see below) actions will be dispatched automatically for you
- automatic and configurable requests aborts, which increases performance and prevents race condition bugs before they even happen
- sending multiple requests in one action - `{ type: FETCH_BOOKS_AND_AUTHORS, request: [{ url: '/books' }, { url: '/authors}'] }`
will send two requests and wrap them in `Promise.all`
- declarative programming - the idea of this library is to encapsulate all requests logic inside actions, so no more scattered logic
between actions, reducers, thunks, sagas and middlewares
- support for Axios, Fetch API, GraphQL and promise based API libraries - additional clients could be added, allowed to use any of them
within one app, you could even write your own client integration as a `driver` (see [./packages/redux-requests-axios/src/axios-driver.js](https://github.com/klis87/redux-requests/blob/master/packages/redux-requests-axios/src/axios-driver.js)
for the example)
- optimistic updates support, so your views can be updated even before requests are finished, while you still keep consistency in case of errors by reverting optimistic updates
- cache support with TTL, so that you can avoid making repetitive requests for a data which does not require to be always fetched
from your server
- mocking - mock driver, which use can use for test purposes or when you would like to integrate with API not yet implemented (and once API is finished, you could just change driver to Axios or Fetch and magicaly everything will work!)
- multiple driver support - for example you can use Axios for one part of your requests and Fetch Api for another part
- compatible with FSA, `redux-act` and `redux-actions` libraries (see [redux-act example](https://github.com/klis87/redux-requests/tree/master/examples/redux-act-integration))
- simple to use with server side rendering - just pass one extra option to `handleRequests` and your app will be ready for SSR!
- `onRequest`, `onSuccess`, `onError` and `onAbort` interceptors, allowing you to define a global behaviour for a given event type
- highly optimized selectors to retrieve your remote state
- automatic (but optional) data normalisation, so you can forget about manual data updates, just like in graphql world but available universally!
- React bindings in `@redux-requests/react` package

## Installation [:arrow_up:](#table-of-content)

To install the package, just run:
```
$ npm install @redux-requests/core
```
or you can just use CDN: `https://unpkg.com/redux-saga-requests`.

Also, you need to install a driver:
- if you use Axios, install `axios` and `@redux-requests/axios`:

  ```
  $ npm install axios @redux-requests/axios
  ```
  or CDN: `https://unpkg.com/redux-saga-requests-axios`.
- if you use Fetch API, install `isomorphic-fetch` (or a different Fetch polyfill) and `@redux-requests/fetch`:

  ```
  $ npm install isomorphic-fetch redux-requests/fetch
  ```
  or CDN: `https://unpkg.com/redux-saga-requests-fetch`.

Also, you have to install `reselect`, which probably you use anyway.

## Usage [:arrow_up:](#table-of-content)

For a quick introduction how things work, see [Motivation](#motivation-arrow_up) paragraph.

Before we go further, let's start with some naming conventions explanation and ideas behind this library.

As you probably noticed in `Motivation` section, one of the used pieces are actions with `request` key.
Let's call them request actions from now. If such an action is dispatched, it will cause an AJAX request
to be fired automatically. Then, depending on the outcome, either corresponding success, error, or abort action will
be dispatched. In the next paragraphs there will be more information about request actions, but for now
know, that request actions are powered by so called drivers. You set drivers in `handleRequest` function. There are
officially supported Axios, Fetch API, GraphQL, promise and mock drivers, but it is very easy to write your own driver.
Just pick whatever you prefer. The key to understand is that if you know how to use Fetch API,
you know how to use Fetch API driver. A config object you would pass to `fetch` function,
now you attach to `request` key inside a request action. Another information which will
be explained later is that you can use `meta` key next to `request`, which is the way to pass some additional options.
One of examples can be `meta.driver` option, which allows you to define driver per request action, that's it,
you can use multiple drivers within one application. It will be described later, for now let's focus on core concepts.

Another important thing is that we can divide `requests` into `queries` and `mutations`.
This is just a naming convention used in this library, borrowed from graphql.
Just remember, that `query` is a request fired to get some data, while `mutation` is a request fired
to cause some side effect, including data update. Or to think about it from different perspective,
if you use REST, usually a query will be a `GET`, `HEAD`, `OPTIONS` request,
and mutation will be a `POST`, `PUT`, `PATCH`, `DELETE` request. Of course, if you use
graphql, no explanation is necessary.

Now, as naming convention is clarified, let's leave actions for now and focus on reducers.
As shown in `Motivation` example, `handleRequests` returns ready to use `requestsReducer`,
which manages all your remote state kept in one place. It does not mean that you cannot
react on requests actions in your own reducers, but most of the time it won't be required.

So, the whole remote state is kept inside one reducer, as one big object attached to `requests` key
in `state`. However, you should not read this state directly in your application, but you should use
selectors provided by this library. Why? Because they are very optimized with the use of `reselect` already,
plus state in requests reducer contains some information which should be treated as an internal implementation
detail, not needed to be understood or used by users of this library. Selectors will be explained in a dedicated chapter,
for now just know that there are selectors `getQuery`, `getMutation` as well as selector creators `getQuerySelector`
and `getMutationSelector`.

## Actions [:arrow_up:](#table-of-content)

As described above, the core in this library are requests actions. As a reminder, requests can be divided as
queries and mutations. Let's give examples how to write such actions, assuming we use Axios driver.
We will write one query and one mutation:
```js
// query
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: {
    url: '/books',
  },
});

// mutation
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: {
    url: `/books/${id}`,
    method: 'delete'
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== id),
    },
  },
});
```

Now, what happens after one of the above actions is dispatched? Let's imagine we dispatch `DELETE_BOOK`
action by `dispatch(deleteBook('1'))`. Because we use Axios, `axios.delete('/books/1')` will be fired.
Then, after AJAX request is finished, either success, error or abort action will be dispatched. So,
in our case, one of the below actions:
```js
// success
{
  type: 'DELETE_BOOK_SUCCESS',
  response: {
    data: {
      id: '1',
      name: 'deleted book',
    },
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete',
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}

// error
{
  type: 'DELETE_BOOK_ERROR',
  error: 'a server error',
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete',
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}

// abort
{
  type: 'DELETE_BOOK_ABORT',
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete',
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}
```

So, again, after you dispatch a request action, after request is finished, a response action
will be dispatched. Depending on the result, `_SUCCESS`, `_ERROR` or `_ABORT` suffix will be added
to request action type.

Now, you probably noticed `meta` key next to `request` in `DELETE_BOOK` action. What's that?
While `request` is used to pass information to a driver you use (in our case Axios), `meta` is the place
to pass some additional options, all of which will be explained later. In our case, there is `meta.mutations`.
Like you probably guessed, this is the place where you can update a query data on mutation success - in our case
we just filter available books so that we remove the one with id `'1'`. Another `meta` property is
that any response action has additional `meta.requestAction` key which gives reference to the related request action.
Also, notice that all meta keys from request action are added to response action to, that's why you see `meta.mutations`
available in response actions too.

### Meta options

Now, let's talk about all options available in `meta`:
- `getData: data => transformedData`: a function which is called on request success, which allows you to
transform data received from server
- `getError: error => transformedError`: a function which is called on request error, which allows you to
transform error received from server
- `asMutation: boolean`: it can be used to force treating of a request action as mutation when `true` or query when `false`
- `driver: string`: only if you use multiple drivers, more details in `multiple drivers` chapter
- `takeLatest: boolean`: when `true`, if a request of a given type is pending and another one is fired, the first one will be
automatically aborted, which can prevent race condition bugs and improve performance, default as `true` for queries and `false`
for mutations, which is usually what you want
- `requestKey: string` - by default it is assumed that you only need to store information once for a given request type,
like its data, error or loading state, so that `fetchBook('2')` would override data for previous book, like with `id` `'1'`, you can
change it behaviour with this property, like `requestKey: id`
- `requestsCapacity: number` - use together with `requestKey`, it prevents memory leak, imagine you dispatch requests with 1000+
different `requestKey`, passing `requestsCapacity: 2` would remove state for 1st request after 3rd is resolved and so on, so
FIFO rule is applied here
- `normalize: boolean` - automatically normalize `data` on response success, more information in `normalisation` chapter
- `cache: boolean | number` - it can be used to cache queries, forever when `true` or for a number of seconds, more information
in `middleware` chapter
- `dependentRequestsNumber: number` - number of requests which will be fired after this one, only for SSR purposes, more information in `middleware` chapter
- `isDependentRequest: boolean`: used together with `dependentRequestsNumber`, and similarly used for SSR
- `optimisticData`: an object which will be normalized on request as an optimistic update
- `revertedData`: an object which will be normalized on response error so if optimistic update failed
- `localData`: it can be attached to any action, even not request action, to normalize data without request
- `silent: boolean`: after setting to `false` no action will be dispatched for given request, so reducers won't be hit,
useful if you want to make a request and not store it, or in interceptor to avoid duplicated actions in some cases
- `onRequest`: like `onRequest` interceptor, but used only for this specific action
- `onSuccess`: like `onSuccess` interceptor, but used only for this specific action
- `onError`: like `onError` interceptor, but used only for this specific action
- `onAbort`: like `onAbort` interceptor, but used only for this specific action
- `runOnRequest: boolean`: passing `true` would prevent running `onRequest` interceptor for this action, useful to avoid infinitive loops in some cases
- `runOnSuccess`: like above, but for `onSuccess` interceptor
- `runOnError`: like above, but for `onError` interceptor
- `runOnAbort`: like above, but for `onAbort` interceptor
- `mutations`: an object to update queries data, it will be explained below

### Promisified dispatches

By default in Redux `store.dispatch(action)` will just return the dispatched `action` itself.
However, this library change this behaviour for request actions dispatches by returning promises
resolving with responses. Because of that, not only you can await requests to be finished, but also
you can read responses directly from the places you dispatched requests.

For example:
```js
store.dispatch(fetchBooks()).then(({ data, error, isAborted, action })) => {
  // data for success, error for error, isAborted: true for abort
})

// or in a component
class Books extends Component {
  fetch = () => {
    this.props.fetchBooks().then(({ data, error, isAborted, action })) => {
      // data for success, error for error, isAborted: true for abort
    })
  }

  render() {
    useQuery
    // ...
  }
}
```

As you can see, this promise is always resolved, never rejected. Why? To avoid unhandled promise rejection errors.
Imagine you dispatch a request action somewhere, but in this place you are not interested in result. You just do
`store.dispatch(fetchBooks())`. Now, even if you handle error in another place, like by reading error from state,
in case of promise rejection the warning would be still there.

Anyway, promise is resolved on response as:
- when `success`, as `{ data, action }`
- when `error`, as `{ error, action }`
- when `abort`, as `{ isAborted: true, action }`

So `action` is always there in case you need an access to response action.

Actually there is one case then promise is rejected - a syntax error. Imagine you make an error
in `getData` or `onSuccess` interceptor. In those cases promise will be rejected with syntax error itself,
otherwise the error would be swallowed and you wouldn't know where a problem is.

### Mutations and data updates

Like you probably remember, mutations are requests to cause a side effect, in the contracts to queries which
are used to get data. But how to update data received from queries? We usually do such things in reducers, but with this library
we have another way - `meta.mutations`.

As you saw in `DELETE_BOOK` mutation, there was declared `meta.mutations` object as:
```js
mutations: {
  FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
}
```

Above function will be called on `DELETE_BOOK` success with `data` which is current state of `FETCH_BOOKS` query.
Whatever it returns will be used by reducer responsible for `FETCH_BOOKS` to update data.

Of course, one mutation action can update multiple queries, just add another key.

If you need to have access to data response from mutation action itself, like information about deleted book and so on,
you can access it from passed second argument - that's it, this function actually has signature `(data, mutationData) => updatedData`.

### Updating data of queries with requestType

Now, what if you want to update a data of a query with a `requestKey`? Just add `requestKey`
to queryType, for example:
```js
mutations: {
  [FETCH_BOOK_DETAIL + id]: data => data.id === id ? null : data,
}
```

Assuming we have a query action with `type: FETCH_BOOK_DETAIL` and `meta.requestKey: id`,
as you can see we just append `id` to `FETCH_BOOK_DETAIL`. The update function just returns `null`
when id is matched or data in another case, typically what you would do in a reducer.

### Local updates

You can also update your queries data locally, without even making any mutation request.
How? Just attach `meta.mutations` to any action, like this:
```js
const deleteBookLocally = id => ({
  type: 'DELETE_BOOK_LOCALLY',
  mutations: {
    [FETCH_BOOK_DETAIL + id]: {
      updateData: data => data.id === id ? null : data,
      local: true,
    },
  },
});
```
As you can see, data mutation can be defined also as object with `updateData` key, which is the same
as using update function directly. But with object we can pass some extra options, here we use
`local: true` to tell the library we want to use local mutation.

### Optimistic updates

Sometimes you don't want to wait for a mutation response to update your data, sometimes you want to update it at once.
At the same time you want to have a way to revert data update if actually mutation request failed.
This is so called optimistic update and object notation is useful for that too, like for local mutations.
Here is example:
```js
const deleteBookOptimistic = book => ({
  type: 'DELETE_BOOK_OPTIMISTIC',
  request: {
    url: `/book/${book.id}`,
    method: 'delete',
  },
  meta: {
    mutations: {
      [FETCH_BOOKS]: {
        updateDataOptimistic: data => data.filter(v => v.id !== book.id),
        revertData: data => [book, ...data],
      },
    },
  },
});
```

So, above we have a mutation action with optimistic update for `FETCH_BOOKS` query.
`updateDataOptimistic` is called right away after `DELETE_BOOK_OPTIMISTIC` action is dispatched,
so not on success like in case for `updateData`, while `revertData` is called on `DELETE_BOOK_OPTIMISTIC_ERROR`,
so you can amend the data and revert deletion in case of an unpredicted error.
At the very same time you can still use `updateData` to further update data on `DELETE_BOOK_OPTIMISTIC_SUCCESS`.

### resetRequests

Sometimes you might need to clear data and errors of your requests, including both queries and mutations.
You can use `resetRequests` action to do it. For example:
```js
import { resetRequests } from '@redux-requests/core';

dispatch(resetRequests()); // clear everything
dispatch(resetRequests([FETCH_BOOKS])); // clear errors and data for FETCH_BOOKS query
dispatch(resetRequests([DELETE_BOOKS])); // clear errors if any for for DELETE_BOOKS mutation
dispatch(resetRequests([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]));
// clear errors and data for FETCH_BOOKS and FETCH_BOOK with 1 request key
```

What is important, `resetRequests` apart from reset also aborts all pending requests of the given types.
You can prevent it by passing 2nd argument `dispatch(resetRequests([FETCH_BOOKS], false))`

Also note that `resetRequests` also set query `pristine` to `true` and clears cache if set.

### abortRequests

Sometimes you might need to abort some pending requests manually.
You can use `abortRequests` action to do it, which is used the same as `resetRequests`. For example:
```js
import { abortRequests } from '@redux-requests/core';

dispatch(abortRequests()); // abort everything
dispatch(abortRequests([FETCH_BOOKS])); // abort FETCH_BOOKS
dispatch(abortRequests([DELETE_BOOKS])); // abort DELETE_BOOKS
dispatch(abortRequests([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]));
// abort FETCH_BOOKS and FETCH_BOOK with 1 request key
```

## Selectors [:arrow_up:](#table-of-content)

While it is possible to get a remote state on your own, it is recommented to use below selectors.
For one thing, they are already optimized, reusing cache and clearing it when necessary. Another reason is
that they return only information needed by applications, while state kept in `requestsReducer` contains
more data required by the library itself. Not to mention a situation when you use automatic normalisation.
Data in reducer is kept normalized, while you need it denormalized in your apps. Selectors already know how to denormalize it automatically and quickly, so that you don't even need to worry about it.

### getQuery

`getQuery` is a selector which returns a state for a given query. It is the selector which requires props.
Imagine you want to get a state for `FETCH_BOOKS` query which we played with earlier. You can use it like this:
```js
import { getQuery } from '@redux-requests/core';

const booksQuery = getQuery(state, { type: 'FETCH_BOOKS' });
/* for example {
  data: [{ id: '1', name: 'Some book title' }],
  loading: false,
  error: null,
  pristine: false, // true only when there was no request made for a give type
} */
```

If you are an experienced Redux developer, you might be worried about memoization of `getQuery`.
Fear not! You can call it with different props and memoization is not lost, for example:
```js
const booksQuery = getQuery(state, { type: 'FETCH_BOOKS' });
getQuery(state, { type: 'FETCH_STH_ELSE' });
booksQuery === getQuery(state, { type: 'FETCH_BOOKS' })
// returns true (unless state for FETCH_BOOKS query really changed in the meantime)
```

We only provided example for `type` prop, but here you have the list of all possibilities:
- `type: string`: just pass query action type or action itself when using action creator library
- `requestKey: string`: use it if you used `meta.requestKey` in query action
- `multiple`: set to `true` if you prefer `data` to be `[]` instead of `null` if data is empty, `false` by default
- `defaultData`: use it to represent `data` as an orbitrary object instead of `null`, use top level object though,
not recreate it multiple times not to break selector memoization

### getQuerySelector

It is almost the same as `getQuery`, the difference is that `getQuery` is the selector,
while `getQuerySelector` is the selector creator - it just returns `getQuery`.

It is helpful when you need to provide a selector without props somewhere (like in `useSelector` React hook).
So instead of doing `useSelector(state => getQuery(state, { type: 'FETCH_BOOKS' }))`
you could just `useSelector(getQuerySelector({ type: 'FETCH_BOOKS' }))`.

### getMutation

Almost the same as `getQuery`, it is just used for mutations:
```js
import { getMutation } from '@redux-requests/core';

const deleteBookMutation = getMutation(state, { type: 'DELETE_BOOK' });
/* for example {
  loading: false,
  error: null,
} */
```

It accept `type` and optionally `requestKey` props, which work like for queries.

### getMutationSelector

Like `getQuerySelector`, it just returns `getMutation` selector.

## Reducers [:arrow_up:](#table-of-content)

You won't need to write reducers to manage remote state, because this is done already by `requestsReducer`
returned by `handleRequests`. If you need some extra state attached to queries and mutations, it is much better
just to do it on selectors level, for instance imagine you want to add a property to books:
```js
import { createSelector } from 'reselect';
import { getQuerySelector } from '@redux-requests/core;

const bookQuerySelector = createSelector(
  getQuerySelector({ type: 'FETCH_BOOKS', multiple: true }),
  booksQuery => ({
    ...booksQuery,
    data: booksQuery.data.map(book => ({ ...book, extraProp: 'extraValue' })),
  }),
);
```
Otherwise you would duplicate books state which is a very bad practice.

It is totally fine though to react on requests and responses actions in your reducers
managing a local state, for example:
```js
import { success, error, abort } from '@redux-requests/core';

const FETCH_BOOKS = 'FETCH_BOOKS';

const localReducer = (state, action) => {
  switch (action.type) {
    case FETCH_BOOKS:
      return updateStateForRequestAction(state);
    case success(FETCH_BOOKS):
      return updateStateForSuccessResponseAction(state);
    case error(FETCH_BOOKS):
      return updateStateForErrorResponseAction(state);
    case abort(FETCH_BOOKS):
      return updateStateForAbortResponseAction(state);
    default:
      return state;
  }
};
```

Notice `success`, `error` and `abort` helpers, they just add proper suffixes to
request actions for convenience, so in our case they return `FETCH_BOOKS_SUCCESS`,
`FETCH_BOOKS_ERROR` and `FETCH_BOOKS_ABORT` respectively.

## Middleware [:arrow_up:](#table-of-content)

Depending on used options, `handleRequests` will return a list of ready to use middleware as `requestsMiddleware`.
One middleware is `sendRequestsMiddleware`, which is included in all the cases. Its main job
is to listen to requests actions and execute requests.

There is also `cacheMiddleware` when `cache: true` option, allowing you to cache responses.

Additionally, `clientSsrMiddleware` and `serverSsrMiddleware` are available with `ssr` option.

In any case, you don't need to worry about it, depending on options passed to `handleRequests`,
all required middleware will be included and in the proper order. You just need to use them, like in `Motivation` paragraph.

### Send requests middleware

This contains the core logic of the library. It does many things, like:
- it listens for request actions and executes requests
- depending on the outcome, it also dispatches `success`, `error` or `abort` action for each request
- it returns promise with response for each request actions, so you can wait for responses and read it in the place
you dispatched request actions
- aborts pending requests for `takeLatest: true` cases and for `resetRequests` and `abortRequests` actions

### Cache middleware

Sometimes you might want your responses to be cached for an amount of time or even forever (until the page is not reloaded at least).
Or, putting it another way, you would like to send a given request no more often than once for an amount of time. You can easily
achieve it with an optional cache middleware, just pass `cache: true` to `handleRequests`.

After this, you can use `meta.cache`:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books'},
  meta: {
    cache: 10, // in seconds, or true to cache forever
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
    requestKey: id,
    requestsCapacity: 2 // optional, to clear old cache exceeding this number
  },
});

/* then, you will achieve the following behaviour:
- GET /books/1 - make request, cache /books/1
- GET /books/1 - cache hit
- GET /books/2 - make request, /books/2
- GET /books/2 - cache hit
- GET /books/1 - cache hit
- GET /books/3 - make request, cache /books/3, invalidate /books/1 cache
- GET /books/1 - make request, cache /books/1, invalidate /books/2 cache
*/
```

If you need to clear the cache manually for some reason, you can use `clearRequestsCache` action:
```js
import { clearRequestsCache } from '@redux-requests/core';

dispatch(clearRequestsCache()) // clear the whole cache
dispatch(clearRequestsCache(FETCH_BOOKS)) // clear only FETCH_BOOKS cache
dispatch(clearRequestsCache(FETCH_BOOKS, FETCH_AUTHORS)) // clear only FETCH_BOOKS and FETCH_AUTHORS cache
```

Note however, that `clearRequestsCache` won't remove any query state, it will just remove cache timeout so that
the next time a request of a given type is dispatched, AJAX request will hit your server.
So it is like cache invalidation operation.

Also, cache is compatible with SSR by default, so if you dispatch a request action with meta cache
on your server, this information will be passed to client inside state.

### Server side rendering middleware

Server side rendering is a very complex topic and there are many ways how to go about it.
Many people use the strategy around React components, for instance they attach static methods to components which
make requests and return promises with responses, then they wrap them in `Promise.all`. I don't recommend this strategy
when using Redux, because this requires additional code and potentially double rendering on server, but if you really want
to do it, it is possible as dispatched request actions return promise resolved with response.

However, I recommend using another approach. See [server-side-rendering-example](https://github.com/klis87/redux-requests/tree/master/examples/server-side-rendering) with the complete setup, but in a nutshell you can write universal code like you would
normally write it without SSR, with just only minor additions. Here is how:

1. Before we begin, be advised that this strategy requires to dispatch requests on Redux level, at least those which have to be
fired on application load. So for instance you cannot dispatch them inside `componentDidMount`. The obvious place to dispatch them
is in the place you create store, like `store.dispatch(fetchBooks())`. However, what if your app has multiple routes, and each route has to send
different requests? Well, you need to make Redux aware of current route. I recommend to use a router with first class support for
Redux, namely [redux-first-router](https://github.com/faceyspacey/redux-first-router). If you use `react-router` though, it is
fine too, you just need to integrate it with Redux with
[connected-react-router](https://github.com/supasate/connected-react-router).
2. On the server you need to pass `ssr: 'server'` (`ssr: 'client'` on the client, more in next step)
option to `handleRequests`, which will include SSR middleware in `requestsMiddleware` and additionally return
`requestsPromise` which will be resolved once all requests are finished. Here you can see a possible implementation:
    ```js
    import { createStore, applyMiddleware, combineReducers } from 'redux';
    import axios from 'axios';
    import { handleRequests } from '@redux-requests/core';
    import { createDriver } from '@redux-requests/axios';

    import { fetchBooks } from './actions';

    export const configureStore = (initialState = undefined) => {
      const ssr = !initialState; // if initialState is not passed, it means we run it on server

      const {
        requestsReducer,
        requestsMiddleware,
        requestsPromise,
      } = handleRequests({
        driver: createDriver(
          axios.create({
            baseURL: 'http://localhost:3000',
          }),
        ),
        ssr: ssr ? 'server' : 'client',
      });

      const reducers = combineReducers({
        requests: requestsReducer,
      });

      const store = createStore(
        reducers,
        initialState,
        applyMiddleware(...requestsMiddleware),
      );

      store.dispatch(fetchBooks());

      return { store, requestsPromise };
    };

    // on the server
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { Provider } from 'react-redux';

    // in an express/another server handler
    const { store, requestsPromise } = configureStore();

    requestsPromise
      .then(() => {
        const html = renderToString(
          <Provider store={store}>
            <App />
          </Provider>,
        );

        res.render('index', {
          html,
          initialState: JSON.stringify(store.getState()),
        });
      })
      .catch(e => {
        console.log('error', e);
        res.status(400).send('something went wrong');
      });
    ```
    As you can see, compared to what you would normally do in SSR for redux app, you only need to
    pass the extra `ssr` option to `handleRequests` and wait for `requestsPromise` to be resolved.

    But how does it work? The logic is based on an internal counter. Initially it is set to `0` and is
    increased by `1` after each request is initialized. Then, after each response it is decreased by `1`. So, initially after a first
    request it gets positive and after all requests are finished, its value is again set back to `0`. And this is the moment
    which means that all requests are finished and `requestsPromise` is resolved (with all success actions).

    In case of any request error, `requestsPromise` will be rejected with response error action.

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

3. The last thing you need to do is to pass `ssr: 'client` to `handleRequests`, like you noticed in previous step on the client side, What does it do? Well, it will ignore request actions which match
those already dispatched during SSR. Why? Because otherwise with universal code the same job done on the server
would be repeated on the client.

## handleRequests [:arrow_up:](#table-of-content)

As you probably noticed in other chapters, `handleRequests` is a function which gets some options
and returns object with the following keys:
- `requestsReducer`: ready to use reducer managing the whole remote state, you need to attach it
to `requests` key in `combineReducers`
- `requestsMiddleware`: list of middleware you should pass to `applyMiddleware`
- `requestsPromise`: promise which is resolved after all requests are finished, only with `ssr: 'server'` option

Below you can see all available options for `handleRequests`:
- `driver`: the only option which is required, a driver or object of drivers if you use multiple drivers
- `onRequest`: see interceptors
- `onSuccess`: see interceptors
- `onError`: see interceptors
- `onAbort`: see interceptors
- `cache`: see Cache middleware
- `ssr`: see Server side rendering middleware
- `isRequestAction: (action: AnyAction) => boolean`: here you can adjust which actions are treated
as request actions, usually you don't need to worry about it, might be useful for custom drivers
- `isRequestActionQuery: (requestAction: RequestAction) => boolean`: if this function returns true,
request action is treated as query, if false, as mutation, probably only useful for custom drivers
- `takeLatest: boolean || (action: requestAction) => boolean`: if true, pending requests of a given type
are automatically cancelled if a new request of a given type is fired, by default queries are run as `takeLatest: true`
and mutations as `takeLatest: false`
- `normalize`: by default `false`, see normalisation
- `getNormalisationObjectKey`: see normalisation
- `shouldObjectBeNormalized`: see normalisation

## Interceptors [:arrow_up:](#table-of-content)

You can add global handlers to `onRequest`, `onSuccess`, `onError` add `onAbort`,
just pass them to `handleRequests`, like so:
```js
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';

function onRequest(request, action, store) {
  // do sth with you request, like add token to header, or dispatch some action etc.
  return request;
}

function onSuccess(response, action, store) {
  // do sth with the response, dispatch some action etc
  return response;
}

async function onError(error, action, store) {
  // do sth here, like dispatch some action

  // you must throw error in case you dont want to catch error
  // or return response as { data } if you want to recover from error

  if (tokenExpired(error)) {
    try {
      // trying to get a new token, we use axios directly not to touch redux
      const { data } = await axios.post('/refreshToken');

      saveNewToken(data.token); // for example to localStorage

      // we fire the same request again:
      // - with silent: true not to dispatch duplicated actions
      const newResponse = await store.dispatch({
        ...action,
        meta: {
          ...action.meta,
          silent: true,
        },
      });

      if (newResponse.data) {
        return { data: newResponse.data };
      }
    } catch(e) {
      // we didnt manage to get a new token
      throw error;
    }
  }

  // not related token error, we pass it like nothing happened
  throw error;
}

function onAbort(action, store) {
  // do sth, for example an action dispatch
}

handleRequests({
  driver: createDriver(axios),
  onRequest,
  onSuccess,
  onError,
  onAbort,
);
```

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
Then, success, error and abort actions will also be FSA compliant.
For details, see [redux-act example](https://github.com/klis87/redux-requests/tree/master/examples/redux-act-integration).

## Usage with Fetch API [:arrow_up:](#table-of-content)

All of the above examples show Axios usage, in order to use Fetch API, just pass Fetch driver to `handleRequests`:
```js
import 'isomorphic-fetch'; // or a different fetch polyfill
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/fetch';

handleRequests({
  driver: createDriver(
    window.fetch,
    {
      baseURL: 'https://my-domain.com' // optional - it works like axios baseURL, prepending all relative urls
      AbortController: window.AbortController, // optional, if your browser supports AbortController or you use a polyfill like https://github.com/mo/abortcontroller-polyfill
    }
  ),
});
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

Just install `@redux-requests/graphql` driver. See
[docs](https://github.com/klis87/redux-requests/tree/master/packages/redux-requests-graphql)
for more info.

## Usage with promise based API libraries [:arrow_up:](#table-of-content)

Just install `@redux-requests/promise` driver. See
[docs](https://github.com/klis87/redux-requests/tree/master/packages/redux-requests-promise)
for more info.

## Mocking [:arrow_up:](#table-of-content)

Probably you are sometimes in a situation when you would like to start working on a feature which needs some integration with
an API. What you can do then? Probably you just wait or start writing some prototype which then you will polish once API is finished. You can do better with `@redux-requests/mock`, especially with multi driver support, which you can read about in the
next paragraph. With this driver, you can define expected responses and errors which you would get from server and write your app
normally. Then, after API is finished, you will just need to replace the driver with a real one, like Axios or Fetch API, without
any additional refactoring necessary, which could save you a lot of time!

You can use it like this:
```js
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/mock';

const FETCH_PHOTO = 'FETCH_PHOTO';

const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

handleRequests({
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
})
```

## Multiple drivers [:arrow_up:](#table-of-content)

You can use multiple drivers if you need it. For example, if you want to use Axios by default, but also Fetch API
sometimes, you can do it like this:
```js
import axios from 'axios';
import 'isomorphic-fetch';
import { handleRequests } from '@redux-requests/core';
import { createDriver as createAxiosDriver } from '@redux-requests/axios';
import { createDriver as createFetchDriver } from '@redux-requests/fetch';

handleRequests({
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

## Normalisation [:arrow_up:](#table-of-content)

Normalisation is a process of keeping data in such a way that information is not duplicated.
So for instance if you have a book with id `1` in multiple queries, it should be stored only in
one place anyway. This way state is better organized plus updates are easy - book has to be updated
only in one place no matter in how many queries it is present.

Typically `normalizr` is used in Redux world to normalize data, it has big disadvantage though, namely
you need to do everything manually. This library suggests 100% automatic approach, which you might
already see in GraphQL world like in Apollo library.

This library does similar thing, but not only for GraphQL, but for anything, including REST!

How does it work? By default nothing is normalized. You can pass `normalize: true` to `handleRequests`
to normalize everything, or you can use request action `meta.normalize: true` to activate it
per request type.

Now, lets say you have two queries:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: { url: '/books' },
  meta: { normalize: true },
});

const fetchBook = id => ({
  type: 'FETCH_BOOK',
  request: { url: `/books/${id}` },
  meta: { normalize: true },
})
```
and `getQuery` returns the following data:
```js
import { getQuery } from '@redux-requests/core';

const booksQuery = getQuery(state, { type: 'FETCH_BOOKS' });
// booksQuery.data is [{ id: '1', title: 'title 1'}, { id: '2', title: 'title 2'}]

const bookDetailQuery = getQuery(state, { type: 'FETCH_BOOK' });
// bookDetailQuery.data is { id: '1', title: 'title 1'}
```

Now, imagine you have a mutation to update book title. Normally you would need to do
something like that:
```js
const updateBookTitle = (id, newTitle) => ({
  type: 'UPDATE_BOOK_TITLE',
  request: { url: `books/${id}`, method: 'PATCH', data: { newTitle } },
  meta: {
    mutations: {
      FETCH_BOOKS: (data, mutationData) => data.map(v => v.id === id ? mutationData : v),
      FETCH_BOOK: (data, mutationData) => data.id === id ? mutationData : data,
    },
  },
})
```
assuming `mutationData` is equal to book with updated title.

Now, because we have queries normalized, we can also use normalization in mutation:
```js
const updateBookTitle = (id, newTitle) => ({
  type: 'UPDATE_BOOK_TITLE',
  request: { url: `books/${id}`, method: 'PATCH', data: { newTitle } },
  meta: { normalize: true },
})
```

No manual mutations! How does it work? By default all objects with `id` key are
organized by their ids. Now, if you use `normalize: true`, any object with key `id`
will be normalized, which simply means stored by id. If there is already a matching object
with the same id, new one will be deeply merged with the one already in state.
So, if only server response data from `UPDATE_BOOK_TITLE` is `{ id: '1', title: 'new title' }`,
this library will automatically figure it out to update `title` for object with `id: '1'`.

It also works with nested objects with ids, no matter how deep. If an object with id has other objects
with ids, then those will be normalized separately and parent object will have just reference to those nested
objects.

Anyway, to make those things work, the following conditions has to be meet:
1) you have to have a standardized way to identify your objects, usually this is just `id` key
2) ids have to be unique across the whole app, if not, you will need to append something to them,
the same has to be done in GraphQL world, usually adding `_typename`
3) objects with the same ids should have consistent structure, if an object like book in one
query has `title` key, it should be `title` in others, not `name` out of a sudden

Two functions which can be passed to `handleRequest` can help to meet those requirements,
`shouldObjectBeNormalized` and `getNormalisationObjectKey`.

`shouldObjectBeNormalized` can help you with 1) point, if for instance you identify
objects differently, for instance by `_id` key, then you can pass
`shouldObjectBeNormalized: obj => obj._id !== undefined` to `handleRequest`.

`getNormalisationObjectKey` allows you to pass 2nd requirement. For example, if your ids
are unique, but not across the whole app, but within object types, you could use
`getNormalisationObjectKey: obj => obj.id + obj.type` or something similar.
If that is not possible, then you could just compute a suffix yourself, for example:
```js
const getType = obj => {
  if (obj.bookTitle) {
    return 'book';
  }

  if (obj.surname) {
    return 'user';
  }

  throw 'we support only book and user object';
}

{
  getNormalisationObjectKey: obj => obj.id + getType(obj),
}
```

Point 3 should always be met, if not, your really should ask your backend developers
to keep things standardized and consistent. As a last resort, you can amend response in
`meta.getData`.

Unfortunately it does not mean you will never use `meta.mutations`. Some updates still need
to be done like usually, namely adding and removing items from array. Why? Imagine `REMOVE_BOOK`
mutation. This book could be present in many queries, library cannot know from which query
you would like to remove it. The same for `ADD_BOOK`, library cannot know to which query a book should be added,
or even as which array index. The same thing for action like `SORT_BOOKS`. This problem is only for top
level arrays though. For instance, if you have a book with some id and another key like `likedByUsers`,
then if you return new book with updated list in `likedByUsers`, this will work again automatically.

There are also 3 action meta options dedicated for normalized data:
- `optimisticData`: cousin of meta.mutation `updateDataOptimistic`,
- `revertedData`: cousin of meta.mutation `revertData`
- `localData`: cousing of meta.mutation `updateData` with `local: true`

Just attached an object or objects with ids there to update data, for example:
```js
const likeBooks = ids => ({
  type: 'LIKE_BOOKS',
  meta: {
    localData: ids.map(id => ({ id, liked: true })),
  },
})
```

## React bindings [:arrow_up:](#table-of-content)

Just install `@redux-requests/react`. See
[docs](https://github.com/klis87/redux-requests/tree/master/packages/redux-requests-react)
for more info.

## Examples [:arrow_up:](#table-of-content)

I highly recommend to try examples how this package could be used in real applications. You could play with those demos
and see what actions are being sent with [redux-devtools](https://github.com/zalmoxisus/redux-devtools-extension).

There are following examples currently:
- [basic](https://github.com/klis87/redux-requests/tree/master/examples/basic)
- [advanced](https://github.com/klis87/redux-requests/tree/master/examples/advanced)
- [mutations](https://github.com/klis87/redux-requests/tree/master/examples/mutations)
- [normalisation](https://github.com/klis87/redux-requests/tree/master/examples/normalisation)
- [Fetch API](https://github.com/klis87/redux-requests/tree/master/examples/fetch-api)
- [GraphQL](https://github.com/klis87/redux-requests/tree/master/examples/graphql)
- [redux-act integration](https://github.com/klis87/redux-requests/tree/master/examples/redux-act-integration)
- [mock-and-multiple-drivers](https://github.com/klis87/redux-requests/tree/master/examples/mock-and-multiple-drivers)
- [server-side-rendering](https://github.com/klis87/redux-requests/tree/master/examples/server-side-rendering)
- [promise driver](https://github.com/klis87/redux-requests/tree/master/examples/promise-driver)

## Licence [:arrow_up:](#table-of-content)

MIT
