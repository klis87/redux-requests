---
title:  clearRequestsCache
description: clearRequestsCache API reference for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

`clearRequestsCache` is a built-in action, which you might need to clear the cache manually for some reason,
for example:
```js
import { clearRequestsCache } from '@redux-requests/core';

// clear the whole cache
dispatch(clearRequestsCache())

// clear only FETCH_BOOKS cache
dispatch(clearRequestsCache(FETCH_BOOKS))

// clear only FETCH_BOOKS and FETCH_AUTHORS cache
dispatch(clearRequestsCache(FETCH_BOOKS, FETCH_AUTHORS))
```

Note however, that `clearRequestsCache` won't remove any query state, it will just remove cache timeout so that
the next time a request of a given type is dispatched, AJAX request will hit your server.
So it is like cache invalidation operation.

