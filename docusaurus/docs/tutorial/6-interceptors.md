---
title:  6. Interceptors
---

What if you need to make a side effect for a given request, or maybe a response success
or an error? What if you need to add a token to all or most of requests? This is
where **interceptors** come into play.

There are four types of **interceptors**: `onRequest`, `onSuccess`, `onError` and
`onAbort`. Also, there are two ways to add them. You can either attach them to a given
request action inside `meta` or you can pass them to `handleRequests` to intercept
all requests.

Now, let's analyze all **interceptors** first.

## `onRequest`

`onRequest` allows you to change a request action before a request is made. For instance,
you could add a token to all of your request actions if it exists. Let's see an example:
```js
import { getToken } from './selectors';

const onRequest = (request, requestAction, store) => {
  const token = getToken(store.getState());

  if (token) {
    return {
      ...request,
      headers: {
        ...request.headers,
        Authorization: token,
      },
    };
  }

  return request;
}
```

So, `onRequest` is just a function which receives `request` object (from request action for convenience),
`requestAction` itself and `store` (so you can read state and dispatch other actions).
Here we just check whether `token` exists and if yes, we add `Authorization` header.
Imagine you needed to do this for dozens of different requests types! Interceptors
are perfect to implement a global logic.

However, interceptors are also useful for creating side effects. Yes, you could
do this with a custom middleware, sagas etc, but see below example:
```js
import { addMessage } from './actions';

const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books' },
  meta: {
    onRequest: (request, requestAction, store) => {
    store.dispatch(addMessage('We are going to fetch books'));
    return request;
  },
})
```

What is nice about this way is that you have everything in one place - inside action.
There is a nice word to describe this style - **collocation**. What is easier to understand
and maintain applications, to read different files with actions, reducers, sagas, epics, middleware
and trying to connect all the pieces? Or... just looking at a given action? Probably
there are people got used to separating related logic into multiple files, but this
library strongly advocates collocation approach and provides many features like interceptors
to make it easier to achieve. Of course this approach is not enforced, you can still
you sagas for side effects if you want, you have many options.

## `onSuccess`

`onSuccess` interceptor is fired after a successful response is received from the server,
but before `success` action is dispatched. You can use it then to amend response or
to provide a side effect like another action dispatched before `success` action is fired,
like:
```js
const onSuccess = (response, requestAction, store) => {
  if (shouldBeTransformed(response)) {
    return transform(response);
  }

  return response;
}
```

Just remember to always return `response` and that `response` has to be an object
with `data` key.

Also, be aware that it is possible to return a Promise resolving with `response`.
Likewise, `onSuccess` can be an `async` function too.

## `onError`

`onError` interceptor is fired after an error response is received from the server,
but before `error` action is dispatched. You can use it then to amend error,
to provide a side effect or even to recover from error and replace `error` response
with `success`.

The easiest example of `onError` is to dispatch an error message or any error:
```js
const onError = (error, requestAction, store) => {
  store.dispatch(addMessage('Something wrong happened!'));
  throw error;
}
```
A very important things here is that you need to `throw` error (passed or another)
or return a rejected promise with am error. Forgetting about it will probably
create some bugs, because if you don't rethrow, it will be treated that error is fixed.

This is because it is possible to recover from error. Imagine you received an error
because a token expired. This can be an usual occurrence in your application and you
might want to handle it in centralized place. See this example:
```js
const onError = async (error, requestAction, store) => {
  if (tokenExpired(error)) {
    const token = getCurrentToken(store.getState());

    const { data } = await store.dispatch({
      type: 'REFRESH_TOKEN',
      request: {
        url: '/refresh-token'
        method: 'post',
        data: { token },
      },
    });

    // we didn't manage to get new token
    if (!data) {
      throw error;
    }

    saveNewToken(data.token); // for example to localStorage

    // we fire the same request again with new token
    const newResponse = await store.dispatch({
      ...requestAction,
      request: {
        ...requestAction.request,
        data: {
          ...requestAction.request.data,
          token: data.token,
        },
      },
    });

    if (newResponse.data) {
      return { data: newResponse.data };
    }
  }

  // either not token related error or we failed again
  throw error;
}
```
The key thing to notice above is that if you return an object with `data` key in
`onError`, the error will be catched and `success` action will be fired later instead
of `error`.

Interestingly, above example is a little simplified, as there are things to worry about
when making requests inside interceptors, namely duplicated actions or even infinite loops!
We will get back to this problem a little later.

## `onAbort`

`onAbort` is called for any request which was not finished because it was aborted.
Probably you will never use it, but it is available just in case. It looks like that:
```js
const onAbort = (requestAction, store) => {
  // do sth, for example an action dispatch
  // you don't need to return anything
}
```

## `meta.silent` and `meta.runOn...`

Let's go back to `onError` example with token refresh. We pointed that above example
was a little simplified. Before we improve it, here is the list of additional `meta`
options related to interceptos:
- `silent: boolean`: after setting to `false` no action will be dispatched for a given request, so reducers won't be hit,
useful if you want to make a request and not store it, or in an interceptor to avoid duplicated actions in some cases
- `runOnRequest: boolean`: passing `false` would prevent running `onRequest` interceptor for this action, useful to avoid infinitive loops in some cases
- `runOnSuccess`: like above, but for `onSuccess` interceptor
- `runOnError`: like above, but for `onError` interceptor
- `runOnAbort`: like above, but for `onAbort` interceptor

With this knowledge, let's rewrite `onError` interceptor:
```js
const onError = async (error, requestAction, store) => {
  if (tokenExpired(error)) {
    const token = getCurrentToken(store.getState());

    const { data } = await store.dispatch({
      type: 'REFRESH_TOKEN',
      request: {
        url: '/refresh-token'
        method: 'post',
        data: { token },
      },
      meta: {
        silent: true, // we don't care to store it in reducer
        runOnError: false, // we don't need to... refresh token during refreshing token
      },
    });

    // we didn't manage to get new token
    if (!data) {
      throw error;
    }

    saveNewToken(data.token); // for example to localStorage

    // we fire the same request again with new token
    const newResponse = await store.dispatch({
      ...requestAction,
      request: {
        ...requestAction.request,
        data: {
          ...requestAction.request.data,
          token: data.token,
        },
      },
      meta: {
         ...requestAction.meta,
         silent: true, // to avoid duplicated request and response actions
         runOnError: false, // to prevent potential infinite loops!
         runOnSuccess: false, // to prevent double run of onSuccess for this action
      },
    });

    if (newResponse.data) {
      return { data: newResponse.data };
    }
  }

  // either not token related error or we failed again
  throw error;
}
```
Hopefully comments in the code are enough to understand what is going on. The most
interesting thing probably is using `runOnSuccess: false`. Why it could be necessary?
Because if you recover from error in `onError`, as the next step `onSuccess` will
be called. So in our case disabling `onSuccess` execution avoids potential issues
of executing `onResponse` twice, like duplicated side effects and so on.

Generally, those options depend on your use case, sometimes you might get away without using them,
sometimes they will be necessary to use. Just be aware of their existance and use when appropriate.

## Global interceptors

Based on above example you already know how to use local interceptos. That's it,
you just add them to action `meta`. For global interceptors, you just need to pass
them to `handleRequests`:
```js
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';

import { onRequest, onSuccess, onError, onAbort } from './my-interceptors';

handleRequests({
  driver: createDriver(axios),
  onRequest,
  onSuccess,
  onError,
  onAbort,
);
```
