---
title:  4. Reacting to request actions
---

Despite the fact this library advocates using mostly actions and built-in selectors,
it doesn't mean you still cannot use normal Redux you know. You can still intercept, listen
to request actions in your reducers, middleware, sagas or whatever you use.

With request actions this is easy, just treat it as a normal Redux action. But what
about response actions, like success, error and abort actions? For that you can use
helpers, which add proper suffixes to request types, for example:
```js
import { success, error, abort } from '@redux-requests/core'

const FETCH_BOOKS = 'FETCH_BOOKS';

const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books' },
})

const defaultState = {
  data: null,
  error: null,
  pending: 0,
}

const booksReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_BOOKS:
      return { ...state, pending: state.pending + 1 };
    case success(FETCH_BOOKS):
      return {
        data: action.response.data,
        pending: state.pending - 1,
        error: null,
      },
    case error(FETCH_BOOKS):
      return {
        data: null,
        pending: state.pending - 1,
        error: action.error,
      },
    case abort(FETCH_BOOKS):
      return { ...state, pending: state.pending - 1 };
    default:
      return state;
}

```

So, as you can see, you can use `success`, `error` and `abort` helpers to handle
any response action. Above we created a reducer which manages `data`, `error` and `pending`
state of `FETCH_BOOKS` query. However, this is just for demonstration purposes, it
is recommended to use built-in `requestsReducer` instead. More typical use case
to react to response actions in your custom reducer would be to handle a local state.
