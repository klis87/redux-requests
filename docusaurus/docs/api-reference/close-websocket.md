---
title: closeWebsocket
description: closeWebsocket API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`closeWebsocket` is a built-in action which closes an active websocket connection, for example:

```js
import { closeWebsocket } from '@redux-requests/core';

dispatch(closeWebsocket());

// optionally you can pass closing code (default is 1000)
dispatch(closeWebsocket(3000));
```

Typically you won't pass `code` here, which defaults to `1000` - meaning clean closing. When closing is clean, then there won't be
any trials to automatically reconnect it. However, note, that passing something else than `1000` will trigger websocket
reconnection if you use it.
