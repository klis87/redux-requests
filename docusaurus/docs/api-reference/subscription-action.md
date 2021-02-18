---
title: SubscriptionAction
description: SubscriptionAction API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`SubscriptionAction` is a type which defines the structure of subscription actions. Like
all Redux actions it obviously has a `type` property. Also it must have `subscription`
property and might have `meta` property.

## `subscription`

This is mandatory key in any subscription action.

```js
const onBookAdded = () => ({
  type: 'ON_BOOK_ADDED',
  subscription: {
    type: 'ON_BOOK_ADDED',
  },
});
```

Just pass it whatever your websocket server needs to start the subscription. Then, it will be automatically send to your server.
If your server doesn't need any message to start the subscription, just pass `null`.

## `meta`

While `subscription` key is mandatory, `meta` is optional. As an example, let's add a `meta` property
to `ON_BOOK_ADDED` action:

```js
const onBookAdded = id => ({
  type: 'ON_BOOK_ADDED',
  subscription: {
    type: 'ON_BOOK_ADDED',
  },
  meta: {
    requestKey: id,
  },
});
```

which would allow having multiple and independent subscriptions for `ON_BOOK_ADDED`, per id.

Below you can see the list of all possible `meta` options:

### `getData: data => transformedData`

A function which is called on received messages, which allows you to transform data received from server.

### `requestKey: string`

Allows you to have multiple independent subscriptions for the same type, per requestKey.

### `normalize: boolean`

Automatically normalize `data` from server messages. More information in
[automatic normalisation tutorial](../tutorial/10-automatic-normalisation).

### `onMessage: (data, message, store) => void`

Function which will be called on each received message from the server. It can be used for side-effects.

### `mutations`

An object to instruct a subscription how to update queries data. Its keys are just
query types and values are update functions, for example for `ON_BOOK_ADDED` subscription we could have:

```js
mutations: {
  FETCH_BOOKS: (data, subscriptionData) => [...data, subscriptionData.addedBook],
}
```
