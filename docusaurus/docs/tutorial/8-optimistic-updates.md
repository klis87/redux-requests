---
title: 8. Optimistic updates
description: 8th part of the tutorial for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

Sometimes you don't want to wait for a mutation response to update your data. This
can improve perceived performance of your app. If you can predict in advance how data will be updated,
you might want to update it immediately. For that you can use **optimistic updates**.
See an example:

```js
const deleteBookOptimistic = book => ({
  type: DELETE_BOOK_OPTIMISTIC,
  request: {
    url: `/book/${book.id}`,
    method: 'delete',
  },
  meta: {
    mutations: {
      FETCH_BOOKS: {
        updateDataOptimistic: data => data.filter(v => v.id !== book.id),
        revertData: data => [book, ...data],
      },
    },
  },
});
```

So, above we have a mutation action with optimistic update for `FETCH_BOOKS` query.
`updateDataOptimistic` is called right away after `DELETE_BOOK_OPTIMISTIC` action is dispatched,
so not on success like in case for `updateData`.

Also, notice `revertData` key. Because we use optimistic data update, we need to be ready for an error, which
always could happen. `revertData` allows you to update `data` to the previous state.
`revertData` is called on `DELETE_BOOK_OPTIMISTIC_ERROR`,
so you can amend the data and revert deletion in case of an unpredicted error.

At the very same time you can still use `updateData` to further update data on `DELETE_BOOK_OPTIMISTIC_SUCCESS`.
This might be useful if you cannot predict data update fully. For example you might
want to do optimistic update to add an item with random id and amend it to a proper
value once mutation response is delivered.
