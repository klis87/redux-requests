---
title:  Usage with redux-saga
description: Redux-saga guide for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

## How to use it with `redux-saga`?

Many people use `redux-saga` to handle application side-effects. The good news is
that this library is totally compatible with it. Just use `redux-saga` normally,
see several examples below to get some ideas.

## Dispatching request actions

You can dispatch request actions from sagas like any other action. So, for example:
```js
import { put } from 'redux-saga/effects';

function* fetchBookSaga() {
  yield put(fetchBooks());
}
```

What to do if you need to read a response in saga? Request action dispatches return
promises, so you can use `putResolve` instead:
```js
import { putResolve } from 'redux-saga/effects';

function* fetchBookSaga() {
  const { data, error, isAborted, action } = yield putResolve(fetchBooks());
}
```

## Reading requests state

Just use `select` effect and `getQuerySelector` or `getMutationSelector`, for example:
```js
import { select } from 'redux-saga/effects';
import { getQuerySelector } from '@redux-requests/core';

function* booksQuerySaga() {
  const booksQueryState = yield select(getQuerySelector({ type: 'FETCH_BOOKS' }));
}
```

## Reacting to request and response actions

Request action is just a Redux action, so you can listen with `take` as usually:
```js
import { take } from 'redux-saga/effects';

function* onFetchBookRequest() {
  yield take('FETCH_BOOKS');
  // do sth
}
```

For response actions it is the same, but you also can use response helpers:
```js
import { take } from 'redux-saga/effects';
import { success, error, abort } from '@redux-requests/core';

function* onFetchBookSuccess() {
  yield take(success('FETCH_BOOKS'));
  // do sth
}

function* onFetchBookError() {
  yield take(error('FETCH_BOOKS'));
  // do sth
}

function* onFetchBookAbort() {
  yield take(abort('FETCH_BOOKS'));
  // do sth
}
```


