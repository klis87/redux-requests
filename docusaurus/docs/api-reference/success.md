---
title:  success
---

This is a small helper which adds a proper suffix to request action types, it can
be useful to compute type of successful response action, for example:
```js
import { success } from '@redux-requests/core';

success('FETCH_BOOKS') === 'FETCH_BOOKS_SUCCESS'
```
