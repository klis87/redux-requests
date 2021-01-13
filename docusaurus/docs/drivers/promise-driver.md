---
title: Promise driver
description: Working with promises guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## Introduction

This driver is useful when you want to work directly with promises. For instance,
you could already have a ready to use library implementing communication with an API.

## Installation

To install the package, just run:

```bash
npm install @redux-requests/promise
```

or you can just use CDN: `https://unpkg.com/@redux-requests/promise`.

## Usage

As for any driver, you must pass it to `handleRequests`:

```js
import { createDriver } from '@redux-requests/promise';

handleRequests({
  driver: createDriver({
    AbortController: window.AbortController,
    processResponse: response => ({ data: response }),
  }),
});
```

`AbortController` is optional, by default it will use `AbortController` if available,
with fallback to `DummyAbortController` which does nothing. If your environment doesn't
support `AbortController`, you could pass a [polyfill](https://github.com/mo/abortcontroller-polyfill).
If you don't, requests abort won't work.

`processResponse` is also optional, the default is `response => ({ data: response })`,
it is useful if your promises resolve to more things than `data`, then you could for instance use
`response => ({ data: response.data })`

Once you have done that, you can use promises in request actions:

```js
const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: {
    promise: axios.get(`https://jsonplaceholder.typicode.com/photos/${id}`),
  },
});
```

Also note, that for mutations you need to pass `meta.asMutation: true` in your request actions,
so the core library could know whether a request is a query or a mutation. For many drivers
like `axios`, `fetch` and `graphql` it is not usually necessary as the library can deduct
whether something is a query or a mutation by looking at request config, like `GET` request method
will be typically a query while `POST` a mutation.
