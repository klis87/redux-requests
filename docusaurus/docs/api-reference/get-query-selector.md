---
title:  getQuerySelector
description: getQuerySelector API reference for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

It is almost the same as `getQuery`, the difference is that `getQuery` is the selector,
while `getQuerySelector` is the selector creator - it just returns `getQuery`.

It is helpful when you need to provide a selector without props somewhere (like in `useSelector` React hook).
So instead of doing `useSelector(state => getQuery(state, { type: 'FETCH_BOOKS' }))`
you could just `useSelector(getQuerySelector({ type: 'FETCH_BOOKS' }))`.
