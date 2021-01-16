---
title: stopPolling
description: stopPolling API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`stopPolling` is a built-in action which stops active pollings,
for example:

```js
import { stopPolling } from '@redux-requests/core';

// stop polling for everything
dispatch(stopPolling());

// stop polling for FETCH_BOOKS
dispatch(stopPolling([FETCH_BOOKS]));

// stop polling for DELETE_BOOKS
dispatch(stopPolling([DELETE_BOOKS]));

// stop polling for FETCH_BOOKS and FETCH_BOOK with 1 request key
dispatch(
  stopPolling([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]),
);
```
