---
title: addWatcher
description: addWatcher API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`addWatcher` is a built-in action which allows you to increment number of watchers for a given request,
for example:

```js
import { addWatcher } from '@redux-requests/core';

dispatch(addWatcher(FETCH_BOOKS));
```

Typically you will never use this action, it is useful only in order to integrate UI libraries like React with `redux-requests`.
For instance, it is used by the officially supported `@redux-requests/react` to automatically reset queries and mutations
once no component uses a given request type.
