---
id: motivation
title: Motivation
---

With `redux-saga-requests`, assuming you use `axios` you could refactor a code in the following way:

```diff
  import axios from 'axios';
- import { takeEvery, put, call } from 'redux-saga/effects';
+ import { all } from 'redux-saga/effects';
+ import { handleRequests } from 'redux-saga-requests';
+ import { createDriver } from 'redux-saga-requests-axios'; // or another driver

  const FETCH_BOOKS = 'FETCH_BOOKS';
- const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
- const FETCH_BOOKS_ERROR = 'FETCH_BOOKS_ERROR';

- const fetchBooks = () => ({ type: FETCH_BOOKS });
- const fetchBooksSuccess = data => ({ type: FETCH_BOOKS_SUCCESS, data });
- const fetchBooksError = error => ({ type: FETCH_BOOKS_ERROR, error });
+ const fetchBooks = () => ({
+   type: FETCH_BOOKS,
+   request: {
+     url: '/books',
+     // you can put here other Axios config attributes, like method, data, headers etc.
+   },
+ });

- const defaultState = {
-   data: null,
-   pending: 0, // number of pending FETCH_BOOKS requests
-   error: null,
- };
-
- const booksReducer = (state = defaultState, action) => {
-   switch (action.type) {
-     case FETCH_BOOKS:
-       return { ...defaultState, pending: state.pending + 1 };
-     case FETCH_BOOKS_SUCCESS:
-       return { ...defaultState, data: action.data, pending: state.pending - 1 };
-     case FETCH_BOOKS_ERROR:
-       return { ...defaultState, error: action.error, pending: state.pending - 1 };
-     default:
-       return state;
-   }
- };

- const fetchBooksApi = () => axios.get('/books');
-
- function* fetchBooksSaga() {
-   try {
-     const response = yield call(fetchBooksApi);
-     yield put(fetchBooksSuccess(response.data));
-   } catch (e) {
-     yield put(fetchBooksError(e));
-   }
- }
-
  const configureStore = () => {
+   const { requestsReducer, requestsSagas } = handleRequests({
+     driver: createDriver(axios),
+   });
+
    const reducers = combineReducers({
-     books: booksReducer,
+     requests: requestsReducer,
    });

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
      reducers,
      applyMiddleware(sagaMiddleware),
    );

    function* rootSaga() {
-     yield takeEvery(FETCH_BOOKS, fetchBooksSaga);
+     yield all(requestsSagas);
    }

    sagaMiddleware.run(rootSaga);
    return store;
  };
```

With `redux-saga-requests`, you no longer need to define error and success actions to do things like error handling
or showing loading spinners. You don't need to write requests related repetitive sagas and reducers either.
You don't even need to worry about writing selectors, as this library provides optimized selectors out of the box.
With action helper library like `redux-actions`, you don't even need to write constants!
So basically you end up writing just actions to manage your whole remote state, so no more famous boilerplate in your Redux apps!

Here you can see the list of features this library provides:
- you define your AJAX requests as simple actions, like `{ type: FETCH_BOOKS, request: { url: '/books' } }` and `success`,
`error` (`abort` is also supported, see below) actions will be dispatched automatically for you
- `success`, `error` and `abort` functions, which add correct and consistent suffixes to your request action types, so you can easily
react on response actions in your reducers/sagas/middleware
- `handleRequests` function, which gives you all the pieces needed for this library to work
- automatic and configurable requests aborts, which increases performance and prevents race condition bugs before they even happen
- sending multiple requests in one action - `{ type: FETCH_BOOKS_AND_AUTHORS, request: [{ url: '/books' }, { url: '/authors}'] }`
will send two requests and wrap them in `Promise.all`
- declarative programming - the idea of this library is to encapsulate all requests logic inside actions, so no more scattered logic
between actions, reducers, sagas and middlewares
- support for Axios, Fetch API and GraphQL - additional clients could be added, allowed to use any of them
within one app, you could even write your own client integration as a `driver` (see [./packages/redux-saga-requests-axios/src/axios-driver.js](https://github.com/klis87/redux-saga-requests/blob/master/packages/redux-saga-requests-axios/src/axios-driver.js)
for the example)
- optimistic updates support, so your views can be updated even before requests are finished, while you still keep consistency in case of errors by reverting optimistic updates
- cache support with TTL, so that you can avoid making repetitive requests for a data which does not require to be always fetched
from your server
- mocking - mock driver, which use can use for test purposes or when you would like to integrate with API not yet implemented (and once API is finished, you could just change driver to Axios or Fetch and magicaly everything will work!)
- multiple driver support - for example you can use Axios for one part of your requests and Fetch Api for another part
- compatible with FSA, `redux-act` and `redux-actions` libraries (see [redux-act example](https://github.com/klis87/redux-saga-requests/tree/master/examples/redux-act-integration))
- simple to use with server side rendering - just pass one extra option to `handleRequests` and your app will be ready for SSR!
- `onRequest`, `onSuccess`, `onError` and `onAbort` interceptors, you can attach your sagas (or simple functions)
to them to define a global behaviour for a given event type
- optional `requestsPromiseMiddleware`, which promisifies requests actions dispatch, so you can wait in your react components to get request response, the same way like you can do this with `redux-thunk`
- highly optimized selectors to retrieve your remote state
- automatic (but optional) data normalisation, so you can forget about manual data updates, just like in graphql world but available universally!
- React bindings in `redux-saga-requests-react` package
