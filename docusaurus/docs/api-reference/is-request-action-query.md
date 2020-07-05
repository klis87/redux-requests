---
title:  isRequestActionQuery
---

`isRequestActionQuery` is a small helper function which checks whether a request action
is a query or a mutation, for example:
```js
import { isRequestActionQuery } from '@redux-requests/core';

const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: {
    url: '/books',
  },
});

isRequestActionQuery(fetchBooks()) === true;
```

Note that it assumes that analyzed action is a request action, so if you are not sure
about that, use `isRequestAction` first before passing it to `isRequestActionQuery`.
