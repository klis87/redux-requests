# @redux-requests/fetch

[![npm version](https://badge.fury.io/js/%40redux-requests%2Ffetch.svg)](https://badge.fury.io/js/%40redux-requests%2Ffetch)
[![Build Status](https://travis-ci.org/klis87/redux-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Fetch API driver to Redux-Saga - addon to simplify handling of AJAX requests.

## Installation

To install the package, just run:
```
$ npm install isomorphic-fetch @redux-requests/fetch
```
or you can just use CDN: `https://unpkg.com/@redux-requests/fetch`.

## Usage

For a general usage, see [redux-requests docs](https://github.com/klis87/redux-requests).

Regarding Fetch API related usage, here you can see a typical setup:
```js
import 'isomorphic-fetch'; // or a different fetch polyfill
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/fetch';

handleRequests({
  driver: createDriver(
    window.fetch,
    {
      baseURL: 'https://my-domain.com' // optional - it works like axios baseURL, prepending all relative urls
      AbortController: window.AbortController, // optional, if your browser supports AbortController or you use a polyfill like https://github.com/mo/abortcontroller-polyfill
    }
  ),
});
```
And in order to create Fetch API requests, below:
```js
fetch('/users', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
});
```
should be translated to this:
```js
const fetchUsers = () => ({
  type: 'FETCH_USERS',
  request: {
    url: '/users/',
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }
});
```
The point is, you can use the same request config like you do with pure Fetch API, but you need to pass `url` in the
config itself. Also, one additional parameter you could provide in the config is `responseType`, which is set as `json`
as the default. Available response types are: `'arraybuffer'`, `'blob'`, `'formData'`, `'json'`, `'text'`, or `null`
(if you don't want a response stream to be read for the given response).

Also, this driver reads response streams automatically for you (depending on `responseType` you choose)
and sets it as `response.data`, so instead of doing `response.json()`, just read `response.data`.

## Licence

MIT
