---
title: Basic usage
description: Basic usage guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## Initial setup

Before you start using `redux-requests` library, just add below snippet to your code:

```js
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios'; // or another driver

const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(axios),
  });

  const reducers = combineReducers({
    requests: requestsReducer,
  });

  const store = createStore(reducers, applyMiddleware(...requestsMiddleware));

  return store;
};
```

So, as you can see, all you need to do is call `handleRequests` function
with a driver of your choice and use the returned reducer and middleware
in `createStore`.

## Queries

After initial setup is done, you will gain a power to send AJAX requests with just Redux actions!

For example, imagine you have and endpoint `/books`. With pure `axios`, you could
make a request as:

```js
axios.get('/books').then(response => response.data);
```

With `redux-requests` all you need to do is write a Redux action and dispatch it:

```js
const FETCH_BOOKS = 'FETCH_BOOKS';

const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    // you can put here other Axios config attributes, like data, headers etc.
  },
});

// somewhere in your application
store.dispatch(fetchBooks());
```

`fetchBooks` is just a Redux action with `request` object. This object is actually
a config object passed to a driver of your choice - in our case `axios`. From now
on let's call such actions as **request actions**.

So, what will happen after such an action is dispatched? The AJAX request will be made
and depending on the outcome, either `FETCH_BOOKS_SUCCESS`, `FETCH_BOOKS_ERROR`
or `FETCH_BOOKS_ABORT` action will be dispatched automatically and data, error and
loading state will be saved in the reducer.

To read response, you can wait until request action promise is resolved:

```js
store.dispatch(fetchBooks()).then(({ data, error, isAborted, action }) => {
  // do sth with response
});
```

... or with `await` syntax:

```js
const { data, error, isAborted, action } = await store.dispatch(fetchBooks());
```

However, usually you would prefer to read this state just from Redux store.
For that you can use built-in selectors:

```js
import { getQuery } from '@redux-requests/core';

const { data, error, loading, pristine } = getQuery(state, {
  type: FETCH_BOOKS,
});
```

What is **query** by the way? This is just a naming convention used by this library,
actually borrowed from _GraphQL_. There are two sorts of requests - **queries**
and **mutations**. **Queries** are made just to fetch data and they don't cause
side-effects. This is in contrast to **mutations** which cause side-effects, like
data update, user registration, email sending and so on. By default requests with
`GET` method are queries and others like `POST`, `PUT`, `PATCH`, `DELETE` are mutations,
but this also depends on drivers and can be configured.

For people wondering, `pristine` is true only when there was no request made for a given type yet.
This flag could be useful when server could reply with `data` as `null` and you would
need to know whether `data` is really `null` or just because no request was made.

## Mutations

What about updating data? Let's say you could update a book with `axios` like that:

```js
axios.post('/books/1', { title: 'New title' });
```

which would update `title` of book with `id: 1` to `new title`.

Again, let's implement it as Redux action:

```js
const UPDATE_BOOK = 'UPDATE_BOOK';

const updateBook = (id, title) => ({
  type: UPDATE_BOOK,
  request: {
    url: `/books/${id}`,
    method: 'post',
    data: { title },
  },
  meta: {
    mutations: {
      [FETCH_BOOKS]: (data, mutationData) =>
        data.map(book => (book.id === id ? mutationData : book)),
    },
  },
});

// somewhere in your application
store.dispatch(updateBook('1', 'New title'));
```

There are several interesting things here. First of all, notice `post` method,
so this request action is actually a **mutation**. Also, look at `meta` object.
Actually request actions can have not only `request` object, but also `meta`.
The convention is that `request` object is related to a driver, while `meta`
allows you to pass driver agnostic options, all of which will be described later.
Here we use `mutations`, which in this case is used to update data of `FETCH_BOOKS` query.
The first argument is `data` (current `data` of `FETCH_BOOKS` query) and `mutationData`
(data returned from server for `UPDATE_BOOK` mutation).

And how to read responses and mutation state? Similar to queries:

```js
store
  .dispatch(updateBook('1', 'New title'))
  .then(({ data, error, isAborted, action }) => {
    // do sth with response
  });
```

... or with `await` syntax:

```js
const { data, error, isAborted, action } = await store.dispatch(
  updateBook('1', 'New title'),
);
```

... or just by using selector:

```js
import { getMutation } from '@redux-requests/core';

const { error, loading } = getMutation(state, { type: UPDATE_BOOK });
```

Notice no `data` in `getMutation` - this is because mutations are made to cause
side-effects, like data update. We don't store `data` in reducers for mutations,
we do this only for queries.

## Request actions philosophy

Notice, that usually you would do such a thing like data update with a reducer. But this library has
a different approach, it manages the whole remote state with one global reducer (`requestsReducer`) and
advocates having update instructions in requests actions themselves. This has the following advantages:

- you don't need to write reducers, just actions
- all logic related to a request is kept in one place, encapsulated in a single action
- because there is one global reducer, remote state is standardized which allowed
  to implement many features like caching, automatic normalisation and so on
- as a consequence of above, you also don't need to write selectors, they are provided for you

A theoretical disadvantage is that passing a function like update function to an action
makes it not serializable. But in reality this is not a problem, only reducers have to be serializable,
actions not, for example time travel will still work.

Of course you still could listen to request actions in your reducers, but
it is recommended to do this only for an additional state, so you would not duplicate
state stored in `requestsReducer`, which is never a good thing.

## What's next?

To get more familiar with the usage of this library, it is very important to go through
[tutorial](../tutorial/1-request-aborts) first which will help understand API of this library and its assumptions.

Then, you could check out how to [use drivers](../drivers/using-drivers) and pick
a driver of your choice or write your own if needed.

It is also advised to read [actions](../guides/actions) and [selectors](../guides/selectors)
guides.

Then, you could see [examples](examples), read other guides or scan the whole [API](../api-reference/request-action)
to see all the available options.
