---
title: handleRequests
description: handleRequests API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

As you probably noticed in other chapters, `handleRequests` is a function which gets some options
and returns an object with all the pieces necessary to pass to `redux`, like `requestsReducer` etc.

## `handleRequest` response object

`handleRequests` response object contains the following keys:

### `requestsReducer`

Ready to use reducer managing the whole remote state, you need to attach it
to `requests` key in `combineReducers`.

### `requestsMiddleware`

A list of middleware you should pass to `applyMiddleware`. This list is dynamic and
depends on other options, like `cache` and `ssr`.

### `requestsPromise`

A promise which is resolved after all requests are finished, only with `ssr: 'server'` option.

## `handleRequest` options

### `driver`

The only option which is required, a driver or object of drivers if you use multiple drivers.

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

### `cache: boolean`

Set to `true` if you need to use caching. See [caching tutorial](../tutorial/9-caching) for more info.

### `ssr: 'client' | 'server'`

Pass `server` on the server and `client` on the client to activate server side rendering support.
See [server side rendering guide](../guides/server-side-rendering).

### `disableRequestsPromise: boolean`

It only matters when `ssr: 'server'`, you can set it to `true` if you don't need to be notified by `requestsPromise` when
all requests were resolved. Typically you would set it to `true` when using React SSR suspense, `false` by default.

### `isRequestAction: action => boolean`

Here you can adjust which actions are treated
as request actions, usually you don't need to worry about it, it might be useful for custom drivers.

### `isRequestActionQuery: requestAction => boolean`

If this function returns true, request action is treated as query, if false, as mutation, probably only useful for custom drivers.

### `takeLatest: boolean || requestAction => boolean`

When `true`, if a request of a given type is pending and another one is fired, the first one will be
automatically aborted, which can prevent race condition bugs and improve performance, default as `true` for queries and `false`
for mutations, which is usually what you want. See [abort tutorial](../tutorial/1-requests-aborts) for more info.

### `normalize: boolean`

By default `false`, pass `true` to turn on normalisation for all requests.
See [automatic normalisation tutorial](../tutorial/10-automatic-normalisation) for more info.

### `getNormalisationObjectKey: obj => string`

`obj => obj.id` by default, useful only if you use normalisation.
See [automatic normalisation tutorial](../tutorial/10-automatic-normalisation) for more info.

### `shouldObjectBeNormalized: obj => string`

`obj => obj.id !== undefined` by default, useful only if you use normalisation.
See [automatic normalisation tutorial](../tutorial/10-automatic-normalisation) for more info.
