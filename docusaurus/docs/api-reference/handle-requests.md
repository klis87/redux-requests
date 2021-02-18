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

### `subscriber`

Only if you have a websocket server to connect to and you want to use subscriptions. It is an object with the following attributes:

#### `url: string`

The only required attribute. It is just an address of your websocket server, for example `ws://localhost:3000/ws`

#### `protocols: string | string[]`

Only if your websocket server requires it. It will be passed as 2nd argument to `WebSocket` constructor.

#### `WS`

Pass if you want to use your own `WebSocket` constructor. By default `window.WebSocket` is used.

#### `onOpen: (store, ws, props) => void`

A function executed when a new websocket connection is established. For example you can dispatch some actions or send
a message to websocket server:

```js
(store, ws, props) => {
  store.dispatch(someAction(props));
  ws.send(
    JSON.stringify({
      type: 'messageOnStart',
      props,
    }),
  );
};
```

`Props` are available, if they were passed in `openWebsocket` action.

#### `onClose: (e, store, ws) => void`

A function executed when a websocket connection is closed. For example:

```js
(e, store, ws) => {
  store.dispatch(someAction());
};
```

#### `onError: (e, store, ws) => void`

A function executed on a websocket error. For example:

```js
(e, store, ws) => {
  store.dispatch(someAction());
};
```

#### `onMessage: (data, message, store) => void`

A function which will be called on each received message from the server. It can be used for side-effects.

#### `onSend: (message, subscriptionAction) => any`

It allows you to globally intercept and transform all `subscription` messages sent to websocket server. For example:

```js
(message, subscriptionAction) => {
  return {
    type: 'start',
    payload: message,
  };
};
```

#### `activateOn: message => boolean`

Useful, if you websocket server needs to confirm that connection is opened correctly, for example that the connection
was properly authenticated. For instance:

```js
message => {
  const data = JSON.parse(message.data);
  return data.type === 'connection_confirmed';
};
```

When used, only after a message from the server, which confirms the connection, the connection will be considered as opened.

#### `getData: data => any`

It allows to transform messages reveived from websocket server. Useful especially because this library uses a convenction to
match server messages and subscription actions by `type`. For example a message `{ type: 'ON_BOOK_ADDED', bookId: '1' }` will match a subscription with `type: 'ON_BOOK_ADDED'`. But what if the server message structure is different? For example
`{ id: 'ON_BOOK_ADDED', payload: { bookId: '1' } }`? Then, you could do something like that:

```js
data => {
  if (data.id && data.payload) {
    return { type: data.id, ...data.payload };
  }

  return data;
};
```

#### `onStopSubscriptions: (stoppedSubscriptions, action, ws, store) => void`

Perhaps you websocket server requires a message from the client to stop a subscription. When you dispatch `stopSubscriptions`
action, still those actions would be ignored by the client, however it is a waste for the server to send messages
which would be ignored anyway. Here you can see an example from `graphql` subscriptions:

```js
(stoppedSubscriptions, action, ws) => {
  if (!ws) {
    return;
  }

  stoppedSubscriptions.forEach(subscription => {
    ws.send(JSON.stringify({ type: 'stop', id: subscription }));
  });
};
```

#### `lazy: boolean`

If `false`, then the client will be automatically connected to the websocket server. Pass `true`, if you prefer to
connect manually by dispatching `openWebsocket` action. Typically `true` is needed, if you need to pass some extra
props to `openWebsocket` action, `false` by default.

#### `isHeartbeatMessage: message => boolean`

Using heartbeats is a nice way to detect when websocket connection is interrupted in a reliable way. If your websocket server supports heartbeats, you can provide a function to detect them. For instance:

```js
message => {
  const data = JSON.parse(message.data);
  return data.type === 'heartbeat';
};
```

#### `heartbeatTimeout: number`

Only if `isHeartbeatMessage` is defined. Length of a period in seconds, within which the client must receive a heartbeat message from the server. If not, websocket will be automatically closed. Then, if `reconnectTimeout` is defined, the client will try to automatically reconnect. `20` by default.

#### `reconnectTimeout: number`

Number of seconds, after which the client will try to reconnect after websocket connection has been closed uncleanly.
`5` by default. Pass `null` if you prefer to disable automatic reconnections.
