---
title: createRequestsStore
description: createRequestsStore API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

As always, in order to create a request, you must dispatch a **request action**, for instance:

```js
const { data, error } = await store.dispatch(fetchBook('1'));
```

There is a problem though, `dispatch` is not properly typed, because the official `Redux` types for `dispatch` cannot know about
middleware from this library, which returns a promise with server response for dispatched request actions.

Fortunately, in all places you would dispatch **request actions**, you could use `RequestsStore` and its `dispatchRequest` method:

```js
import { createRequestsStore } from '@redux-requests/core';

const requestsStore = createRequestsStore(store);
const { data, error } = await requestsStore.dispatchRequest(fetchBook('1'));
```

Now, result of `dispatchRequest` is properly typed, and as a bonus, if you defined `Data` generic in dispatched
action, also `data` will be typed! Again, automatic type inference!

Regarding functionality, `createRequestsStore` doesn't do anything else than normal store, it just decorates passed store
with `dispatchRequest` method which is just a copy of normal `dispatch`. So, `dispatchRequest` does exactly the same thing
as `dispatch`, the only difference is that `dispatchRequest` is properly typed.

What's interesting, in all interceptors you have access to `RequestsStore` instead of `Store`, so you already could utilize
`dispatchRequest` there.
