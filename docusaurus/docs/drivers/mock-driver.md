---
title:  Mock driver
description: Mocking guide for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

## Introduction

This driver could be useful for tests or if you want to work on integration with an API endpoint
which is not finished yet. It doesn't really do any requests, it just pretends to do them.
With the help of `mock` driver, instead of waiting for backend developers you can
immediately start working with `mock` driver for some of your request actions and then
you could replace it with a "real" driver like `axios` once backend is ready.

## Installation

To install the package, just run:
```bash
$ npm install @redux-requests/mock
```
or you can just use CDN: `https://unpkg.com/@redux-requests/mock`.

## Usage

As always, pass it to `handleRequests` first:
```js
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/mock';

handleRequests({
  driver: createDriver({
    // optional, in ms, defining how much time mock request would take, useful for testing spinners
    timeout: 1000,
  }),
});
```

Then, start using it inside your request actions:
```js
const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: {
    response: {
      data: {
        id,
        title: 'accusamus beatae ad facilis cum similique qui sunt',
      },
    },
  },
});

const fetchPhotoWhichWillFail = id => ({
  type: FETCH_PHOTO_WHICH_WILL_FAIL,
  request: {
    error: { status: 404 },
  },
});
```

Also note, that for mutations you need to pass `meta.asMutation: true` in your request actions,
so the core library could know whether a request is a query or a mutation. For many drivers
like `axios`, `fetch` and `graphql` it is not usually necessary as the library can deduct
whether something is a query or a mutation by looking at request config, like `GET` request method
will be typically a query while `POST` a mutation.
