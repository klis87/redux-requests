---
title:  RequestAction
description: RequestAction API reference for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

`RequestAction` is a type which defines the structure of request actions. Like
all Redux actions it obviously has a `type` property. Also it must have `request`
property and might have `meta` property.

## `request`

This is mandatory key in any request action. What you put here depends on a driver you use.
For example, when using `axios`, it could look like that:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: {
    url: '/books',
  },
});
```

It is also possible to provide array of configs to make **batch requests**:
```js
const fetchBooksAndAuthors = () => ({
  type: 'FETCH_BOOKS_AND_AUTHORS',
  request: [
    { url: '/books' },
    { url: '/authors' },
  ],
});
```

## `meta`

While `request` key is driver dependent and mandatory, `meta` is optional and its
options don't depend on used driver. As an example, let's add a `meta` property
to `FETCH_BOOKS` action:
```js
const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: {
    url: '/books',
  },
  meta: {
    normalize: true,
  },
});
```
which would turn on automatic normalisation for `FETCH_BOOKS` query.


Below you can see the list of all possible `meta` options:

### `getData: (data, currentData) => transformedData`

A function which is called on response success, which allows you to
transform data received from server, `data` is what you got from the server and `currentData` is data stored in reducer
currently.

### `getError: error => transformedError`

A function which is called on request error, which allows you to
transform error received from server.

### `asMutation: boolean`

It can be used to force treating of a request action as mutation when `true` or query when `false`.
Useful if a driver you use doesn't have a config which could determine whether it is query or mutation.
Also could be handy if your want to treat a mutation (for example `POST` request) as a query for instance
to store its data.


### `driver: string`

Only if you use multiple drivers, more details in [multiple-drivers chapter](../drivers/using-drivers#multiple-drivers).

### `takeLatest: boolean`

When `true`, if a request of a given type is pending and another one is fired, the first one will be
automatically aborted, which can prevent race condition bugs and improve performance, default as `true` for queries and `false`
for mutations, which is usually what you want. See [abort tutorial](../tutorial/1-requests-aborts) for more info.

### `requestKey: string`

By default it is assumed that you only need to store information once for a given request type,
like its data, error or loading state, so that `fetchBook('2')` would override data for previous book, like with `id` `'1'`, you can
change it behaviour with this property, like `requestKey: id`. See [requests keys tutorial](../tutorial/3-request-keys) for more info.

### `requestsCapacity: number`

Use together with `requestKey`, it prevents memory leak, imagine you dispatch requests with 1000+
different `requestKey`, passing `requestsCapacity: 2` would remove state for 1st request after 3rd is resolved and so on, so
FIFO rule is applied here. See [requests keys tutorial](../tutorial/3-request-keys) to see examples.

### `cache: boolean | number`

It can be used to cache queries, forever when `true` or for a number of seconds, more information
in [caching tutorial](../tutorial/9-caching).

### `dependentRequestsNumber: number`

Number of requests which will be fired after this one, only for SSR purposes, more information in
[server side rendering guide](../guides/server-side-rendering).

### `isDependentRequest: boolean`

Used together with `dependentRequestsNumber`, marking a given request as dependent on another,
more information in [server side rendering guide](../guides/server-side-rendering).

### `normalize: boolean`

Automatically normalize `data` on response success, both for queries and mutations. More information in
[automatic normalisation tutorial](../tutorial/10-automatic-normalisation).

### `optimisticData`

An object which will be normalized on request as an optimistic update. More information in
[automatic normalisation tutorial](../tutorial/10-automatic-normalisation).

### `revertedData`

An object which will be normalized on response error so if optimistic update failed.
More information in
[automatic normalisation tutorial](../tutorial/10-automatic-normalisation).

### `localData`

It can be attached to any action, even not request action, to update normalized data without request.
More information in
[automatic normalisation tutorial](../tutorial/10-automatic-normalisation).

### `silent: boolean`

After setting to `false` no action will be dispatched for given request, so reducers won't be hit,
useful if you want to make a request and not store it, or in interceptor to avoid duplicated actions in some cases.

### `onRequest: (request, requestAction, store) => request`

Function which will be called before request is made. It can be used to make some side effects,
for example with `store.dispatch` or to update request config by returning an updated one.
See [interceptors tutorial](../tutorial/6-interceptors).

### `onSuccess: (response, requestAction, store) => response`

Function which will be called after successful response but before success action is dispatched.
It can be used to make some side effects or to update response by returning another one.
See [interceptors tutorial](../tutorial/6-interceptors).

### `onError: (error, requestAction, store) => error`

Function which will be called after error response but before error action is dispatched.
It can be used to make some side effects or to update error by throwing another one.
It is also possible to recover from error by returning a response.
See [interceptors tutorial](../tutorial/6-interceptors).

### `onAbort: (requestAction, store) => void`

Function which will be called after abort but before abort action is dispatched.
Usually it won't be useful, but it is available just in case.
See [interceptors tutorial](../tutorial/6-interceptors).

### `runOnRequest: boolean`

Passing `true` would prevent running `onRequest` interceptor for this action, useful to avoid infinitive loops in some cases.
See [interceptors tutorial](../tutorial/6-interceptors).

### `runOnSuccess: boolean`

Passing `true` would prevent running `onSuccess` interceptor for this action, useful to avoid infinitive loops in some cases.
See [interceptors tutorial](../tutorial/6-interceptors).

### `runOnError: boolean`

Passing `true` would prevent running `onError` interceptor for this action, useful to avoid infinitive loops in some cases.
See [interceptors tutorial](../tutorial/6-interceptors).

### `runOnAbort: boolean`

Passing `true` would prevent running `onAbort` interceptor for this action.
See [interceptors tutorial](../tutorial/6-interceptors).

### `mutations`

An object to instruct a mutation how to update queries data. Its keys are just
query types and values are update functions, for example for `DELETE_BOOK` mutation we could have:
```js
mutations: {
  FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
}
```

It is possible to update multiple queries with one mutation:
```js
mutations: {
  FETCH_BOOK: data => data.id === '1' ? null : data,
  FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
}
```

Update function also has 2nd argument `mutationData` which is just `data` from mutation
response. It could be useful for update mutations like `UPDATE_BOOK`:
```js
mutations: {
  FETCH_BOOK: (data, mutationData) => data.id === '1' ? mutationData : data,
}
```

Actually there is an alias for passing update functions:
```js
mutations: {
  FETCH_BOOK: {
    updateData: (data, mutationData) => data.id === '1' ? mutationData : data,
  },
}
```

As you can see, instead of passing update functions directly, you can pass them inside
object as `updateData` key.

This is to support other options, like `local`, `updateDataOptimistic` and `revertData`.
See [local updates tutorial](../tutorial/7-local-updates) and
[optimistic updates tutorial](../tutorial/8-optimistic-updates) for more information.
