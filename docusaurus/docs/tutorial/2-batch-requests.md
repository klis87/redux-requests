---
title:  2. Batch requests
---

## What are batch requests?

**Batch requests** is about sending multiple requests by dispatching a single request
action (with array of request configs).

## Use cases for batch requests

Let's write a request action to fetch a book detail:
```js
const FETCH_BOOK = 'FETCH_BOOK';

const fetchBook = id => ({
  type: FETCH_BOOK,
  request: {
    url: `/books/${id}`,
  },
});
```

To make a request to get a book with id `1`, as you know from the previous part of the tutorial,
you just need to dispatch the request action:
```js
store.dispatch(fetchBook('1'));
```

You might be wondering, ok, so what if later I would like to get a book with id `2`? Easy:
```js
store.dispatch(fetchBook('2'));
```

You need to know though that after response with book `2` is returned, the book with id `1`
previously stored will be erased, as it will be just overwritten with book `2` data.
This is usually a good think, but what if you need to to have access to multiple books
at the same time? Well, you could just create another request action:
```js
const FETCH_ANOTHER_BOOK = 'FETCH_ANOTHER_BOOK';

const fetchAnotherBook = id => ({
  type: FETCH_ANOTHER_BOOK,
  request: {
    url: `/books/${id}`,
  },
});
```

However, this would be a very inconvenient way. It would be also not scalable, what
if you needed to have an access to 3 or even more books? So there is a better method,
you can use **batch requests**:
```js
const fetchBook = (id, anotherId) => ({
  type: FETCH_BOOK,
  request: [
    { url: `/books/${id}` },
    { url: `/books/${anotherId}` },
  ],
});
```

Notice that it is possible to pass an array of configs to `request`. Let's dispatch it:
```js
store.dispatch(fetchBook('1', '2'));
```

Above dispatch will actually send two requests, one for book `1` and second for book `2`.
Those requests will be wrapped in `Promise.all`, so you will get either successful response
with data as array of all books data or just error response with the first encountered error.

You can send any number of requests, but of course many of them could decrease performance.
Anyway, we could refactor `fetchBook` function to handle any number of ids:
```js
const fetchBook = ids => ({
  type: FETCH_BOOK,
  request: ids.map(id => ({ url: `/books/${id}` }),
});
```
which could be used to get books with ids `1` to `5` like that:
```js
store.dispatch(fetchBook(['1', '2', '3', '4', '5']));
```

There is an alternative strategy to **batch requests** which will be covered
in the next part.
