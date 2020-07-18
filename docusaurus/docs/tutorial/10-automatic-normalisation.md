---
title:  10. Automatic normalisation
---

## What is normalisation?

Normalisation is a process of keeping data in such a way that no information is duplicated.
So for instance if you have a book with id `1` in multiple queries, it should be stored only in
one place anyway. This way state is better organized plus updates are easy - book has to be updated
only in one place no matter in how many queries it is present.

Typically `normalizr` is used in Redux world to normalize data, it has big disadvantage though, namely
you need to do everything manually. However. this library suggests 100% automatic approach, which you might
already see in GraphQL world like in Apollo library.

This library does similar thing, but not only for GraphQL, but for anything, including REST!

## How does it work?

By default nothing is normalized. You can pass `normalize: true` to `handleRequests`
to normalize everything, or you can use request action `meta.normalize: true` to activate it
per request type.

Now, lets say you have two queries:
```js
const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: { url: '/books' },
  meta: { normalize: true },
});

const fetchBook = id => ({
  type: FETCH_BOOK,
  request: { url: `/books/${id}` },
  meta: { normalize: true },
})
```
and `getQuery` returns the following data:
```js
import { getQuery } from '@redux-requests/core';

const booksQuery = getQuery(state, { type: 'FETCH_BOOKS' });
// booksQuery.data is [{ id: '1', title: 'title 1'}, { id: '2', title: 'title 2'}]

const bookDetailQuery = getQuery(state, { type: 'FETCH_BOOK' });
// bookDetailQuery.data is { id: '1', title: 'title 1'}
```

Now, imagine you have a mutation to update a book title. Normally you would need to do
something like that:
```js
const updateBookTitle = (id, newTitle) => ({
  type: UPDATE_BOOK_TITLE,
  request: { url: `books/${id}`, method: 'PATCH', data: { newTitle } },
  meta: {
    mutations: {
      FETCH_BOOKS: (data, mutationData) => data.map(v => v.id === id ? mutationData : v),
      FETCH_BOOK: (data, mutationData) => data.id === id ? mutationData : data,
    },
  },
})
```
assuming `mutationData` is equal to the book with updated title.

Now, because we have queries normalized, we can also use normalization in mutation:
```js
const updateBookTitle = (id, newTitle) => ({
  type: 'UPDATE_BOOK_TITLE',
  request: { url: `books/${id}`, method: 'PATCH', data: { newTitle } },
  meta: { normalize: true },
})
```

No manual mutations! How does it work? By default all objects with `id` key are
organized by their ids. Now, if you use `normalize: true`, any object with key `id`
will be normalized, which simply means stored by id. If there is already a matching object
with the same id, new one will be deeply merged with the one already in state.
So, if only server response data from `UPDATE_BOOK_TITLE` is `{ id: '1', title: 'new title' }`,
this library will automatically figure it out to update `title` for object with `id: '1'`.

It also works with nested objects with ids, no matter how deep. If an object with id has other objects
with ids, then those will be normalized separately and parent object will have just reference to those nested
objects.

## Required conditions

In order to make automatic normalisation work, the following conditions must be meet:

1. you must have a standardized way to identify your objects, usually this is just `id` key
2. ids must be unique across the whole app, not only across object types, if not, you will need to append something to them,
the same has to be done in GraphQL world, usually adding `_typename`
3. objects with the same ids should have consistent structure, if an object like book in one
query has `title` key, it should be `title` in others, not `name` out of a sudden

Two functions which can be passed to `handleRequest` can help to meet those requirements,
`shouldObjectBeNormalized` and `getNormalisationObjectKey`.

`shouldObjectBeNormalized` can help you with 1st point, if for instance you identify
objects differently, for instance by `_id` key, then you can pass
`shouldObjectBeNormalized: obj => obj._id !== undefined` to `handleRequest`.

`getNormalisationObjectKey` allows you to pass 2nd requirement. For example, if your ids
are unique, but not across the whole app, but within object types, you could use
`getNormalisationObjectKey: obj => obj.id + obj.type` or something similar.
If that is not possible, then you could just compute a suffix yourself, for example:
```js
const getType = obj => {
  if (obj.bookTitle) {
    return 'book';
  }

  if (obj.surname) {
    return 'user';
  }

  throw 'we support only book and user object';
}

{
  getNormalisationObjectKey: obj => obj.id + getType(obj),
}
```

Point 3 should always be met, if not, your really should ask your backend developers
to keep things standardized and consistent. As a last resort, you can amend response with
`meta.getData`.

## Normalisation of arrays

Unfortunately it does not mean you will never use `meta.mutations`. Some updates still need
to be done manually like usually, namely adding and removing items from array. Why? Imagine `REMOVE_BOOK`
mutation. This book could be present in many queries, library cannot know from which query
you would like to remove it. The same applies for `ADD_BOOK`, library cannot know to which query a book should be added,
or even as which array index. The same thing for action like `SORT_BOOKS`. This problem affects only top
level arrays though. For instance, if you have a book with some id and another key like `likedByUsers`,
then if you return new book with updated list in `likedByUsers`, this will work again automatically.

## Normalisation and local/optimistic updates

Automatic normalisation is compatible with local and optimistic updates. There are
3 action meta options dedicated to normalized data:
- `optimisticData`: cousin of meta.mutation `updateDataOptimistic`,
- `revertedData`: cousin of meta.mutation `revertData`
- `localData`: cousing of meta.mutation `updateData` with `local: true`

Just attached an object or objects with ids there to update data, for example:
```js
const likeBooks = ids => ({
  type: 'LIKE_BOOKS',
  meta: {
    localData: ids.map(id => ({ id, liked: true })),
  },
})
```

Dispatching above action like `store.dispatch(likeBooks(['1', '2', '3']))` would
mark books with ids `1`, `2` and `3` as liked.

With optimistic updates usage is similar, for instance:
```js
const likeBookOptimistic = id => ({
  type: 'LIKE_BOOK_OPTIMISTIC',
  meta: {
    optimisticData: { id, liked: true },
    revertedData: { id, liked: false },
  },
})
```
