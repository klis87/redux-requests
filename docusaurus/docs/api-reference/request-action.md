---
title:  RequestAction
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
- `getData: (data, currentData) => transformedData`: a function which is called on request success, which allows you to
transform data received from server, `data` is what you got from the server and `currentData` is data stored in reducer
currently
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
