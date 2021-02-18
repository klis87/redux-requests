---
title: openWebsocket
description: openWebsocket API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`openWebsocket` is a built-in action which opens a new websocket connection, for example:

```js
import { openWebsocket } from '@redux-requests/core';

dispatch(openWebsocket());

// optionally you can pass an object which will be passed to subscripber.onOpen callback,
// useful for things like authentication
dispatch(openWebsocket({ token: 'token' }));
```
