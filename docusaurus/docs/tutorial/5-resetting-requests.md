---
title:  5. Resetting requests
description: 5th part of the tutorial for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

Sometimes you might need to clear data and errors of your requests, including both queries and mutations.
You can use `resetRequests` action to do it. For example:

```js
import { resetRequests } from '@redux-requests/core';

// clear everything
dispatch(resetRequests());

// clear errors and data for FETCH_BOOKS query
dispatch(resetRequests([FETCH_BOOKS]));

// clear errors if any for for DELETE_BOOKS mutation
dispatch(resetRequests([DELETE_BOOKS]));

// clear errors and data for FETCH_BOOKS and FETCH_BOOK with 1 request key
dispatch(resetRequests([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]));
```

What is important, `resetRequests` apart from reset also aborts all pending requests of the given types.
You can prevent it by passing 2nd argument `dispatch(resetRequests([FETCH_BOOKS], false))`.

Also note that `resetRequests` also set query `pristine` to true and clears cache if set
(more about caching in another tutorial).
