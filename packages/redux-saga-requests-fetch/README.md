# redux-saga-requests-fetch

[![npm version](https://badge.fury.io/js/redux-saga-requests-fetch.svg)](https://badge.fury.io/js/redux-saga-requests-fetch)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Fetch API driver to Redux-Saga - addon to simplify handling of AJAX requests.

## Installation

To install the package, just run:
```
$ yarn add isomorphic-fetch redux-saga-requests-fetch
```
or...
```
$ npm install isomorphic-fetch redux-saga-requests-fetch
```
or you can just use CDN: `https://unpkg.com/redux-saga-requests-fetch`.

## Usage

For a general usage, see [redux-saga-requests docs](https://github.com/klis87/redux-saga-requests).

Regarding Fetch API related usage, here you can see a typical setup:
```javascript
import 'isomorphic-fetch'; // or a different fetch polyfill
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import fetchDriver from 'redux-saga-requests-fetch';

function* rootSaga() {
  yield createRequestInstance(
    window.fetch,
    {
      driver: fetchDriver,
      baseURL: 'https://my-domain.com' // optional - it works like axios baseURL, prepending all relative urls
    },
  );
  yield watchRequests();
}
```
And in order to create Fetch API requests, below:
```javascript
fetch('/users', {
  method: 'POST',
  body: data,
});
```
should be translated to this:
```javascript
const fetchUsers = () => ({
  type: 'FETCH_USERS',
  request: {
    url: '/users/',
    method: 'POST',
    body: data,
  }
});
```
The point is, you can use the same request config like you do with pure Fetch API, but you need to pass `url` in the
config itself. Also, one additional parameter you could provide in the config is `responseType`, which is set as `json`
as the default. Available response types are: `arraybuffer`, `blob`, `formData`, `json`, `text`.

## Licence

MIT
