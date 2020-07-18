---
title:  abortRequests
description: abortRequests API reference for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

`abortRequests` is a built-in action which sometimes you might need to abort some pending requests manually,
for example:
```js
import { abortRequests } from '@redux-requests/core';

// abort everything
dispatch(abortRequests());

// abort FETCH_BOOKS
dispatch(abortRequests([FETCH_BOOKS]));

// abort DELETE_BOOKS
dispatch(abortRequests([DELETE_BOOKS]));

// abort FETCH_BOOKS and FETCH_BOOK with 1 request key
dispatch(abortRequests([FETCH_BOOKS, { requestType: FETCH_BOOK, requestKey: '1' }]));
```
