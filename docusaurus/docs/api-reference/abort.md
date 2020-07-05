---
title:  abort
---

This is a small helper which adds a proper suffix to request action types, it can
be useful to compute type of aborted request action, for example:
```js
import { abort } from '@redux-requests/core';

abort('FETCH_BOOKS') === 'FETCH_BOOKS_ABORT'
```
