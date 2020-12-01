---
title: Selectors
description: Selectors guide for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

While it is possible to get a remote state from `requestsReducer` on your own, it is recommented to use below selectors.
For one thing, they are already optimized, reusing cache and clearing it when necessary. Another reason is
that they return only information needed by applications, while state kept in `requestsReducer` contains
more data required by the library itself. Not to mention a situation when you use automatic normalisation.
Data in reducer is kept normalized, while you need it denormalized in your apps. Selectors already know how to denormalize it automatically and quickly, so that you don't even need to worry about it.

## `getQuery`

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

If you are an experienced Redux developer, you might be worried about memoization of `getQuery`.
Fear not! You can call it with different props and memoization is not lost, for example:

```js
const booksQuery = getQuery(state, { type: 'FETCH_BOOKS' });
getQuery(state, { type: 'FETCH_STH_ELSE' });
booksQuery === getQuery(state, { type: 'FETCH_BOOKS' });
// returns true (unless state for FETCH_BOOKS query really changed in the meantime)
```

We only provided example for `type` prop, but here you have the list of all possibilities:

- `type: string`: just pass query action type or action itself when using action creator library
- `requestKey: string`: use it if you used `meta.requestKey` in query action
- `multiple`: set to `true` if you prefer `data` to be `[]` instead of `null` if data is empty, `false` by default
- `defaultData`: use it to represent `data` as an orbitrary object instead of `null`, use top level object though,
  not recreate it multiple times not to break selector memoization

## `getQuerySelector`

It is almost the same as `getQuery`, the difference is that `getQuery` is the selector,
while `getQuerySelector` is the selector creator - it just returns `getQuery`.

It is helpful when you need to provide a selector without props somewhere (like in `useSelector` React hook).
So instead of doing `useSelector(state => getQuery(state, { type: 'FETCH_BOOKS' }))`
you could just `useSelector(getQuerySelector({ type: 'FETCH_BOOKS' }))`.

## `getMutation`

Almost the same as `getQuery`, it is just used for mutations:

```js
import { getMutation } from '@redux-requests/core';

const deleteBookMutation = getMutation(state, { type: 'DELETE_BOOK' });
/* for example {
  loading: false,
  error: null,
  downloadProgress: null, // only when requestAction.meta.measureDownloadProgress is true
  uploadProgress: null, // only when requestAction.meta.measureUploadProgress is true
} */
```

It accept `type` and optionally `requestKey` props, which work like for queries.

## `getMutationSelector`

Like `getQuerySelector`, it just returns `getMutation` selector.
