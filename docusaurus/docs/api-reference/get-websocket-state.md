---
title: getWebsocketState
description: getWebsocketState API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`getWebsocketState` is a selector which returns a state for a current websocket connection. It is useful only if your application uses
subscriptions, you could then use it to know whether websocket connection is opened.

```js
import { getWebsocketState } from '@redux-requests/core';

const { connected, pristine } = getWebsocketState(state);
```

`connected` will be `true` if websocket connection is currently opened, `false` otherwise.
`pristine` is `true` if websocket is not connected, but it was not opened yet or just closed on purpose, `false` means
that websocket connection was closed due to some error, like server is down, internet disconnected and so on.

Typically you could use it do display some error, that notifications are down, for example:

```js
if (!connected && !pristine) {
  showNotificationError();
}
```
