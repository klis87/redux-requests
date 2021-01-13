---
title: Server side rendering
description: SSR guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## What is server side rendering?

Like its name suggests, it is just a way to render you app on the server side. Why
would you do that for single page application? There are many reasons, like SEO,
improving performance in some cases, static rendering like in Gatsby and probably many
others.

Anyway server side rendering is a very complex topic and there are many ways how to go about it.
Many people use the strategy around React components, for instance they attach static methods to components which
make requests and return promises with responses, then they wrap them in `Promise.all`. I don't recommend this strategy
when using Redux, because this requires additional code and potentially double rendering on server, but if you really want
to do it, it is possible as dispatched request actions return promise resolved with response.

However, this guide won't be for introducing server side rendering, it will show alternative
strategies for SSR with the help of this library. You don't need to use any of them,
but you might want to check them out as they could potentially simplify your SSR apps.

## Two SSR strategies

There two recommended strategies for SSR with `redux-requests`:

1. pure Redux strategy, in which you need to dispatch all request actions on the Redux level, then you await promise which will resolve
   once all requests are finished, after which you are ready to render on server side with any framework of your choosing, be it React or anything else
2. React suspense strategy, which assumes that you dispatch request actions from React components

The choice depends on your taste and whether you dispatch actions from Redux or from React. In theory, it should be possible
to use a hybrid/combination of those two methods (and dispatching request actions both from Redux and React level)!

## Pure Redux

Before we begin, be advised that this strategy requires to dispatch request actions on Redux level, at least those which have to be
fired on application load. So for instance you cannot dispatch them inside React `componentDidMount`
or in `useEffect`. The obvious place to dispatch them is in the place you create store, like `store.dispatch(fetchBooks())`. However, what if your app has multiple routes, and each route has to send different requests?
Well, you need to make Redux aware of current route. I recommend to use a router with first class support for
Redux, namely [redux-first-router](https://github.com/faceyspacey/redux-first-router).
If you use `react-router` though, it is fine too, you just need to integrate it with Redux with
[connected-react-router](https://github.com/supasate/connected-react-router) or
[redux-first-history](https://github.com/salvoravida/redux-first-history). Then you
could listen to route change actions and dispatch proper request actions, for example
from middleware, sagas, just whatever you use.

### Basic setup

On the server you need to pass `ssr: 'server'` to `handleRequests` when running on
the server (to resolve/reject `requestsPromise` in the right time) and `ssr: 'client'`
on the client (not to repeat requests again on the client which we run on the server)
option to `handleRequests`. Here you can see a possible implementation:

```jsx
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
    // you can also render React too, like for 404 error
  });
```

As you can see, compared to what you would normally do in SSR for redux app, you only need to
pass the extra `ssr` option to `handleRequests` and wait for `requestsPromise` to be resolved.

### How does it work?

But how does it work? The logic is based on an internal counter. Initially it is set to `0` and is
increased by `1` after each request is initialized. Then, after each response it is decreased by `1`. So, initially after a first
request it gets positive and after all requests are finished, its value is again set back to `0`. And this is the moment
which means that all requests are finished and `requestsPromise` is resolved (with all success actions).

In case of any request error, `requestsPromise` will be rejected with object `{ errorActions: [], successActions: [] }`.

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

## React suspense

This strategy requires using suspense on the server side. Suspense is not officially supported yet on server side,
but it is already possible thanks to [react-async-ssr](https://github.com/overlookmotel/react-async-ssr). Using it
is only temporary, hopefully soon we will have this built inside React core. I tested it and it works surprisingly well,
the only downside is that it officially supports only React 16.6.0-16.9.x. It is not a big issue though as 16.10+ doesn't
really bring any new features.

Anyway, this strategy assumes that you dispatch requests from React components (namely from `useQuery` hooks).

### Basic setup on the server

```jsx
import React from 'react';
import { RequestsProvider } from '@redux-requests/react';
import { createDriver } from '@redux-requests/axios';
import { renderToStringAsync } from 'react-async-ssr';
import axios from 'axios';

// in an express/another server handler

let store;

const html = await renderToStringAsync(
  <RequestsProvider
    requestsConfig={{
      driver: createDriver(
        axios.create({
          baseURL: 'http://localhost:3000',
        }),
      ),
      ssr: 'server',
      disableRequestsPromise: true, // necessary to avoid unhandled promise rejection error
    }}
    getStore={requestsStore => {
      store = requestsStore;
    }}
    suspenseSsr
  >
    <App />
  </RequestsProvider>,
);

res.render('index', {
  html,
  initialState: JSON.stringify(store.getState()),
});
```

That's all there is to it, `App` component can be universal, written like there was no SSR involved at all!
The only thing you need to remember is to wrap your components in `App` by `Suspense`, for example:

```jsx
import React, { Suspense } from 'react';

const App = () => {
  return (
    <Suspense fallback="Loading">
      <AppComponents>
    </Suspense>
  );
};
```

This is needed because `suspenseSsr` option forces suspense on the server for all `useQuery` hooks (no matter what `suspense` option you choose).
Also note, that it doesn't hurt that `Suspense` component would be used on the client side as well - if you don't use suspense on
the client, it will just never be triggered.

### Basic setup on the client

```jsx
import React from 'react';
import axios from 'axios';
import { hydrate } from 'react-dom';
import { RequestsProvider } from '@redux-requests/react';
import { createDriver } from '@redux-requests/axios';

hydrate(
  <RequestsProvider
    requestsConfig={{
      driver: createDriver(
        axios.create({
          baseURL: 'http://localhost:3000',
        }),
      ),
      ssr: 'client',
    }}
    initialState={window.__INITIAL_STATE__}
  >
    <App />
  </RequestsProvider>,
  document.getElementById('root'),
);
```

Simple, isn't it? You just need to use `ssr: 'client'` and pass `initialState` and you are good to go!

## Hybrid approach

In theory you could use combination of those two methods! You could:

1. create your store and run some requests on Redux level
2. await `requestsPromise`
3. render asynchronously React with suspense, you would pass your already created store to `RequestsProvider`
4. additional requests would be fired on React level

This should work in theory, in has not been tested in practice though, as I usually dispatch actions either from Redux or React,
depending on the app. If you like mixing though, you could definitely try it!
