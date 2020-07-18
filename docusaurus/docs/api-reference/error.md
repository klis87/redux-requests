---
title:  error
description: error API reference for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

This is a small helper which adds a proper suffix to request action types, it can
be useful to compute type of error response action, for example:
```js
import { error } from '@redux-requests/core';

error('FETCH_BOOKS') === 'FETCH_BOOKS_ERROR'
```
