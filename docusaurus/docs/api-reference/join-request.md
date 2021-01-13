---
title: joinRequest
description: joinRequest API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`joinRequest` is a built-in action which allows you to get a promise of a pending request,
for example:

```js
import { joinRequest } from '@redux-requests/core';

const response = await dispatch(joinRequest(FETCH_BOOKS));
```

If there is no pending request of a given type, the promise will be resolved with `null`.
