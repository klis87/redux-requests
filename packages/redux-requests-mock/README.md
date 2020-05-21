# @redux-requests/mock

[![npm version](https://badge.fury.io/js/%40redux-requests%2Fmock.svg)](https://badge.fury.io/js/%40redux-requests%2Fmock)
[![Build Status](https://travis-ci.org/klis87/redux-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Mock driver to Redux - addon to simplify handling of AJAX requests.

## Installation

To install the package, just run:
```
$ npm install @redux-requests/mock
```
or you can just use CDN: `https://unpkg.com/@redux-requests/mock`.

## Usage

Probably you are sometimes in a situation when you would like to start working on a feature which needs some integration with
an API. What you can do then? Probably you just wait or start writing some prototype which then you will polish once API is finished. You can do better with `@redux-requests/mock`, especially with multi driver support.
With this driver, you can define expected responses and errors which you would get from server and write your app
normally. Then, after API is finished, you will just need to replace the driver with a real one, like Axios or Fetch API, without
any additional refactoring necessary, which could save you a lot of time!

You can use it like this:
```js
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/mock';

const FETCH_PHOTO = 'FETCH_PHOTO';
const FETCH_PHOTO_ERROR = 'FETCH_PHOTO_ERROR';

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

const fetchPhotoError = id => ({
  type: FETCH_PHOTO_ERROR,
  request: {
    error: { status: 404 },
  },
});

handleRequests({
  driver: createDriver({
    timeout: 1000, // optional, in ms, defining how much time mock request would take, useful for testing spinners
  }),
});
```

## Licence

MIT
