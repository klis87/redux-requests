---
title: getMutation
description: getMutation API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

Almost the same as `getQuery`, it is just used for mutations:

```js
import { getMutation } from '@redux-requests/core';

const deleteBookMutation = getMutation(state, { type: 'DELETE_BOOK' });
/* for example {
  loading: false,
  error: null,
  pending: 0 // number of pending requests
  downloadProgress: null, // only when requestAction.meta.measureDownloadProgress is true
  uploadProgress: null, // only when requestAction.meta.measureUploadProgress is true
} */
```

It accept `type` and optionally `requestKey` props, which work like for queries.
