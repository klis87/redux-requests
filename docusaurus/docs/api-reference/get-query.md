---
title: getQuery
description: getQuery API reference for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

`getQuery` is a selector which returns a state for a given query. It is the selector which requires props.
Imagine you want to get a state for `FETCH_BOOKS` query which we played with earlier. You can use it like this:

```js
import { getQuery } from '@redux-requests/core';

const booksQuery = getQuery(state, { type: 'FETCH_BOOKS' });
/* for example {
  data: [{ id: '1', name: 'Some book title' }],
  loading: false,
  error: null,
  pristine: false, // true only when there was no request made for a give type
  downloadProgress: null, // only when requestAction.meta.measureDownloadProgress is true
  uploadProgress: null, // only when requestAction.meta.measureUploadProgress is true
} */
```

We only provided example for `type` prop, but here you have the list of all possibilities:

- `type: string`: just pass query action type or action itself when using action creator library
- `requestKey: string`: use it if you used `meta.requestKey` in query action
- `multiple`: set to `true` if you prefer `data` to be `[]` instead of `null` if data is empty, `false` by default
- `defaultData`: use it to represent `data` as an orbitrary object instead of `null`, use top level object though,
  not recreate it multiple times not to break selector memoization
- `action`: useful only when you use Typescript, see details [here](/docs/guides/usage-with-typescript#automatic-data-inference)
