---
title:  9. Caching
---

## `cache`

Sometimes you might want your responses to be cached for an amount of time or even forever (until the page is not reloaded at least).
Or, putting it another way, you would like to send a given request no more often than once for an amount of time. You can easily
achieve it with an optional cache middleware. To activate it, just pass `cache: true` to `handleRequests`:
```js
import { handleRequests } from '@redux-requests/core';

handleRequests({
  ...otherOptions,
  cache: true,
});
```

After this, you can use `meta.cache`:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books'},
  meta: {
    cache: 10, // in seconds, or true to cache forever
  },
});
```

What will happen now is that after a succesfull book fetch (to be specific after `FETCH_BOOKS_SUCCESS` is dispatched),
any `FETCH_BOOKS` actions for `10` seconds won't trigger any AJAX calls and the following `FETCH_BOOKS_SUCCESS` will contain
previously cached server response. You could also use `cache: true` to cache forever.

## `cacheKey`

Sometimes you would like to invalidate your cache based on a key, so if a key is changed, then you would bypass the cache
and network would be hit. You can use `meta.cacheKey` for that:
```js
const fetchBooks = language => ({
  type: FETCH_BOOKS,
  request: { url: '/books', params: { language } },
  meta: {
    cache: 10,
    cacheKey: language, // if language changes, cache won't be hit and request will be made
  },
});
```

## Cache with `requestKey`

Another use case is that you might want to keep a separate cache for the same request action based on a key.
Then, like for usual not cached queries, you could use `meta.RequestKey`. For example:
```js
const fetchBook = id => ({
  type: FETCH_BOOK,
  request: { url: `/books/${id}`},
  meta: {
    cache: true,
    requestKey: id,
  },
});

/* then, you will achieve the following behaviour:
- GET /books/1 - make request, cache /books/1
- GET /books/1 - cache hit
- GET /books/2 - make request, cache /books/2
- GET /books/2 - cache hit
- GET /books/1 - cache hit
*/
```

## `cacheKey` and `requestKey` together

You can also use `cacheKey` and `requestKey` at the same time, then different `cacheKey`
will be able to invalidate cache for each `requestKey` individually, like:
```js
const fetchBook = (id, language) => ({
  type: FETCH_BOOK,
  request: { url: `/books/${id}`, params: { language } },
  meta: {
    cache: true,
    cacheKey: language,
    requestKey: id,
  },
});

/* then, you will achieve the following behaviour:
- GET /books/1?language=en - make request, cache /books/1
- GET /books/1?language=en - cache hit
- GET /books/2?language=de - make request, cache /books/2
- GET /books/2?language=en - make request, cache /books/2 again due to changed language
- GET /books/2?language=en - cache hit
*/
```

There is an interesting `requestKey` and `cacheKey` relation. Passing the same
`requestKey` and `cacheKey` is the same like passing only `requestKey`, because
requests are stored separately for each `requestKey`, so cache invalidation with
the same `cacheKey` could never happen.

## Cache with `requestCapacity`

When you use `cache` with `requestKey`, like without caching you can also be worried
about storing too many queries in state. Like there, in the same fashion you can use `requestsCapacity`:
```js
const fetchBook = id => ({
  type: FETCH_BOOK,
  request: { url: `/books/${id}`},
  meta: {
    cache: true,
    requestKey: id,
    requestsCapacity: 2,
  },
});

/* then, you will achieve the following behaviour:
- GET /books/1 - make request, cache /books/1
- GET /books/1 - cache hit
- GET /books/2 - make request, cache /books/2
- GET /books/2 - cache hit
- GET /books/1 - cache hit
- GET /books/3 - make request, cache /books/3, invalidate /books/1 cache
- GET /books/1 - make request, cache /books/1, invalidate /books/2 cache
*/
```

## Manual cache clearing

If you need to clear the cache manually for some reason, you can use `clearRequestsCache` action:
```js
import { clearRequestsCache } from '@redux-requests/core';

// clear the whole cache
dispatch(clearRequestsCache())

// clear only FETCH_BOOKS cache
dispatch(clearRequestsCache(FETCH_BOOKS))

// clear only FETCH_BOOKS and FETCH_AUTHORS cache
dispatch(clearRequestsCache(FETCH_BOOKS, FETCH_AUTHORS))
```

Note however, that `clearRequestsCache` won't remove any query state, it will just remove cache timeout so that
the next time a request of a given type is dispatched, AJAX request will hit your server.
So it is like cache invalidation operation. To remove also data you can use `resetRequests` action.

## SSR compatibility

Also, cache is compatible with SSR by default, so if you dispatch a request action with meta cache
on your server, this information will be passed to client inside state.
