---
title:  7. Local updates
---

What if you need to update a query data locally, without making any request? You
don't control reducer responsible for data updates after all. Fortunately, there is a way - **local updates**.

You can define them in the similar way to normal mutations:
```js
const deleteBookLocally = id => ({
  type: DELETE_BOOK_LOCALLY,
  meta: {
    mutations: {
      FETCH_BOOK_DETAIL: {
        updateData: data => data.id === id ? null : data,
        local: true,
      },
    },
  },
});
```
As you can see, it looks similar to normal mutations. One difference is that there
is no `request` key - after all we didn't want to make any request. Another difference is
that the update function is not attached directly to the query type (in our case `FETCH_BOOK_DETAIL`),
but inside the object as `updateData`. This is because we need to pass also `local: true`
to the mutation to mark is as a local one.
