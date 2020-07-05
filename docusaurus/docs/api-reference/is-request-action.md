---
title:  isRequestAction
---

`isRequestAction` is a small helper function which checks whether a Redux action
is a request action or not, for example:
```js
import { isRequestAction } from '@redux-requests/core';

const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: {
    url: '/books',
  },
});

const notRequest = () => ({ type: 'NOT_REQUEST' });

isRequestAction(fetchBooks()) === true;
isRequestAction(notRequest()) === false
```
