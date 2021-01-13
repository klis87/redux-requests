---
id: motivation
title: Motivation
description: Motivation guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## Genesis

Even in 21st century, making AJAX requests and management of remote state is surprisingly hard!
It looks easy at the beginning, but the more experienced you become, the more aware you are
about problems you didn't consider before. Race conditions, requests aborts, caching, optimistic updates,
error handling, showing spinners for loading state per request, server side rendering...
This list could go on... You could solve all of those problems on the app level yourself,
but think about code amount to achieve it, or potential bugs you could have when having to
worry about so many things, especially with tight deadlines. Should we really worry about
those on the app level?

## The solution

With `redux-requests`, assuming you use `axios` you could refactor a code in the following way:

```diff
  import axios from 'axios';
- import thunk from 'redux-thunk';
+ import { handleRequests } from '@redux-requests/core';
+ import { createDriver } from '@redux-requests/axios'; // or another driver


  const FETCH_BOOKS = 'FETCH_BOOKS';
- const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
- const FETCH_BOOKS_ERROR = 'FETCH_BOOKS_ERROR';
-
- const fetchBooksRequest = () => ({ type: FETCH_BOOKS });
- const fetchBooksSuccess = data => ({ type: FETCH_BOOKS_SUCCESS, data });
- const fetchBooksError = error => ({ type: FETCH_BOOKS_ERROR, error });

- const fetchBooks = () => dispatch => {
-   dispatch(fetchBooksRequest());
-
-   return axios.get('/books').then(response => {
-     dispatch(fetchBooksSuccess(response.data));
-     return response;
-   }).catch(error => {
-     dispatch(fetchBooksError(error));
-     throw error;
-   });
- }

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

  const configureStore = () => {
+   const { requestsReducer, requestsMiddleware } = handleRequests({
+     driver: createDriver(axios),
+   });
+
    const reducers = combineReducers({
-     books: booksReducer,
+     requests: requestsReducer,
    });

    const store = createStore(
      reducers,
-     applyMiddleware(thunk),
+     applyMiddleware(...requestsMiddleware),
    );

    return store;
  };
```

As you can see, with `redux-requests`, you no longer need to define error and success actions to do things like error handling
or showing loading spinners. You don't need to write requests related repetitive sagas and reducers either.
You don't even need to worry about writing selectors, as this library provides optimized selectors out of the box.
With action helper library like [`redux-smart-actions`](https://github.com/klis87/redux-smart-actions), you don't even need to write constants!
So basically you end up writing just actions to manage your whole remote state, so no more famous boilerplate in your Redux apps!
