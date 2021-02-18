---
title: stopSubscriptions
description: stopSubscriptions API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`stopSubscriptions` is a built-in action which stops active subscriptions,
for example:

```js
import { stopSubscriptions } from '@redux-requests/core';

// stop all subscriptions
dispatch(stopSubscriptions());

// stop subscription for FETCH_BOOKS
dispatch(stopSubscriptions([ON_BOOKS_ADDED]));

// stop subscriptions for ON_BOOKS_ADDED and ON_BOOK_ADDED with 1 request key
dispatch(stopSubscriptions([ON_BOOKS_ADDED, `${ON_BOOK_ADDED}1`]));
```
