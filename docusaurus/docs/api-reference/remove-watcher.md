---
title: removeWatcher
description: removeWatcher API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`removeWatcher` is a built-in action which allows you to decrement number of watchers for a given request,
for example:

```js
import { removeWatcher } from '@redux-requests/core';

dispatch(removeWatcher(FETCH_BOOKS));
```

Typically you will never use this action, it is useful only in order to integrate UI libraries like React with `redux-requests`.
For instance, it is used by the officially supported `@redux-requests/react` to automatically reset queries and mutations
once no component uses a given request type.
