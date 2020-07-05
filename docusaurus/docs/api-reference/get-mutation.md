---
title:  getMutation
---

Almost the same as `getQuery`, it is just used for mutations:
```js
import { getMutation } from '@redux-requests/core';

const deleteBookMutation = getMutation(state, { type: 'DELETE_BOOK' });
/* for example {
  loading: false,
  error: null,
} */
```

It accept `type` and optionally `requestKey` props, which work like for queries.
