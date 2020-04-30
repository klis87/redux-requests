# @redux-requests/promise

[![npm version](https://badge.fury.io/js/redux-saga-requests-promise.svg)](https://badge.fury.io/js/redux-saga-requests-promise)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Promise driver to Redux - addon to simplify handling of AJAX requests.

## Installation

To install the package, just run:

```bash
npm install @redux-requests/promise
```

## Usage

This driver is useful when you work directly with promises.

For instance, you could do something like that:

```js
import { createDriver } from '@redux-requests/promise';

handleRequests({
  driver: createDriver({
    AbortController: window.AbortController,
    processResponse: response =>  ({ data: response }),
  }),
});

const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: {
    promise: axios.get(`https://jsonplaceholder.typicode.com/photos/${id}`),
  },
});
```

`AbortController` is optional, by default it will use `AbortController` if available,
with fallback to `DummyAbortController` which does nothing. If your environment doesn't
support `AbortController`, you could pass a [polyfill](https://github.com/mo/abortcontroller-polyfill).
If you don't, requests abort won't work.

`processResponse` is also optional, the default is `response =>  ({ data: response })`,
it is useful if your promises resolve to more things than `data`, then you could for instance use
`response =>  ({ data: response.data })`

For usage, see [redux-requests docs](https://github.com/klis87/redux-requests).

Also note, that for mutations you need to pass `meta.asMutation: true` in your request actions,
so the core library could know whether a request is a query or a mutation.

## Licence

MIT
