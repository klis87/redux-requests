---
title:  Actions
---

As you probably noticed, this library is all about writing Redux actions. You need to do some
basic setup in `handleRequests`, but then you will mostly write just actions.

## Request actions

You probably remember from the tutorial how request actions look like:
```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: {
    url: `/books/${id}`,
    method: 'delete'
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== id),
    },
  },
});
```

After a request action is dispatched, AJAX request will be made and then a response
action will be dispatched automatically. But how response action looks like actually?

## Response actions

After server delivers a response for a request action, one of three results can happen,
in our case, either `DELETE_BOOK_SUCCESS`, `DELETE_BOOK_ERROR` or `DELETE_BOOK_ABORT`.
See below how those response actions could look like:
```js
{
  type: 'DELETE_BOOK_SUCCESS',
  response: {
    data: {
      id: '1',
      name: 'deleted book',
    },
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete',
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}

{
  type: 'DELETE_BOOK_ERROR',
  error: 'a server error',
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete',
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}

{
  type: 'DELETE_BOOK_ABORT',
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      request: {
        url: '/books/1',
        method: 'delete',
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}
```

As you can see, `type` of response actions is equal to a related request action with
a suffix (`_SUCCESS`, `_ERROR` or `_ABORT`).

Also notice `meta` in any response action, you can find there `requestAction` object,
which is just a related request action which resulted in the response action. Also all `meta`
keys are copied to response actions for convenience, that's why there is `mutations` key there.

Additionally, of course success actions have `response` key and error actions have `error` key.

## Promisified dispatches

By default in Redux `store.dispatch(action)` will just return the dispatched `action` itself.
However, this library change this behaviour for request actions dispatches by returning promises
resolving with responses. Because of that, not only you can await requests to be finished, but also
you can read responses directly from the places you dispatched requests.

For example:
```js
store.dispatch(fetchBooks()).then(({ data, error, isAborted, action })) => {
  // data for success, error for error, isAborted: true for abort
})
```

As you can see, this promise is always resolved, never rejected. Why? To avoid unhandled promise rejection errors.
Imagine you dispatch a request action somewhere, but in this place you are not interested in result. You just do
`store.dispatch(fetchBooks())`. Now, even if you handle error in another place, like by reading error from state,
in case of promise rejection the warning would be still there.

Anyway, promise is resolved on response as:
- when `success`, as `{ data, action }`
- when `error`, as `{ error, action }`
- when `abort`, as `{ isAborted: true, action }`

So `action` is always there in case you need an access to response action.

Actually there is one case then promise is rejected - a syntax error. Imagine you make an error
in `getData` or `onSuccess` interceptor. In those cases promise will be rejected with syntax error itself,
otherwise the error would be swallowed and you wouldn't know where a problem is.

## FSA actions

If you happen to like writing Redux actions as [FSA actions](https://github.com/redux-utilities/flux-standard-action),
you can use them for request actions too, for example:
```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  payload: {
    request: {
      url: `/books/${id}`,
      method: 'delete'
    },
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== id),
    },
  },
});
```

If you do it, response actions will have FSA structure too, for example:
```js
{
  type: 'DELETE_BOOK_SUCCESS',
  payload: {
    response: {
      data: {
        id: '1',
        name: 'deleted book',
      },
    },
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
    },
    requestAction: {
      type: 'DELETE_BOOK',
      payload: {
        request: {
          url: '/books/1',
          method: 'delete',
        },
      },
      meta: {
        mutations: {
          FETCH_BOOKS: data => data.filter(book => book.id !== '1'),
        },
      },
    },
  },
}
```

## Action creator libraries

Because this library is just a Redux addon, it is totally compatible with action
creator libraries, like [redux-smart-actions](https://github.com/klis87/redux-smart-actions),
[redux-actions](https://github.com/redux-utilities/redux-actions) or
[redux-act](https://github.com/pauldijou/redux-act).

For example, when using `redux-smart-actions`:
```js
import { createAction } from 'redux-smart-actions';

const deleteBook = createAction('DELETE_BOOK', id => ({
  request: {
    url: `/books/${id}`,
    method: 'delete'
  },
  meta: {
    mutations: {
      FETCH_BOOKS: data => data.filter(book => book.id !== id),
    },
  },
}));
```

Usage for `redux-actions` and `redux-act` would be similar. Anyway, the key here to know
is that when using libraries like that, you don't need to write constants anymore, just actions!
And, because `deleteBook.toString() === 'DELETE_BOOK'`, you can pass request actions themselves
instead of request action types in many places, for example instead of:
```js
import { getMutation } from 'redux-requests/core';

const deleteBookMutation = getMutation(state, { type: 'DELETE_BOOK' });
```

you could just do:
```js
import { getMutation } from 'redux-requests/core';

const deleteBookMutation = getMutation(state, { type: deleteBook });
```

## Thunks

Sometimes your request actions might need to get an information from Redux store.
Of course you can always pass it as a function argument, but some people prefer using
thunks for this purpose, for example:
```js
const deleteBookThunk = () => (dispatch, getState) => {
  const bookId = currentBookIdSelector(getState());
  return dispatch(deleteBook(bookId));
}
```

This approach could prove very convenient, imagine you need to dispatch `deleteBook`
action in multiple places, you would always need to read `bookId` in each place and pass
it to `deleteBook`. With thunk you must do this only once.

There is a problem though, if you don't like writing constants but you prefer to
use action creator libraries, then you would like your thunks to also contain
`type` as `toString` so that you could pass thunks to `getMutation` directly for example.
Fortunately, this problem is solved by the companion library [redux-smart-actions](https://github.com/klis87/redux-smart-actions). With its help, you could implement `deleteBook` as:
```js
import { createThunk } from 'redux-smart-actions';

const deleteBook = createThunk('DELETE_BOOK', () => (dispatch, getState) => {
  const id = currentBookIdSelector(getState());

  return {
    request: {
      url: `/books/${id}`,
      method: 'delete'
    },
    meta: {
      mutations: {
        FETCH_BOOKS: data => data.filter(book => book.id !== id),
      },
    },
  };
});
```

Now, `deleteBook.toString() === 'DELETE_BOOK'` again, so you can pass it to functions
like `getMutation` and forget about constants even when writing thunks!

## Where to dispatch request actions

This library automatically makes AJAX requests and handles all remote state, but it doesn't
care where you dispatch request actions from. This is totally up to you! You can
dispatch them in sagas, in a middleware, in observables, in React components, from
thunks or even inside routes when using Redux routers like [redux-first-router](https://github.com/faceyspacey/redux-first-router). Basically, in any place you could dispatch a Redux action,
you can dispatch request actions, after all request action is also just Redux action!
