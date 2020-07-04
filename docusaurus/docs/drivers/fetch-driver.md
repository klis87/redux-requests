---
title:  Fetch driver
---

## Introduction

`fetch` driver is for you if you like using `Fetch API` to make AJAX requests.

## Installation

First, install the driver:
```bash
$ npm install  @redux-requests/fetch
```
or you can just use CDN: `https://unpkg.com/@redux-requests/fetch`.

You might want to also install `Fetch API` polyfill, like `isomorphic-fetch`:
```bash
$ npm install isomorphic-fetch
```
but this depends on browsers you want to support and is totally optional. The same
goes for any `AbortController` polyfill.

## Usage

Before you can use `fetch` driver, first pass it to `handleRequests`:
```js
import 'isomorphic-fetch'; // or a different fetch polyfill
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/fetch';

handleRequests({
  driver: createDriver(
    window.fetch,
    {
      baseURL: 'https://my-domain.com' // optional - it works like axios baseURL, prepending all relative urls
      AbortController: window.AbortController, // optional, if your browser supports
      //AbortController or you use a polyfill like https://github.com/mo/abortcontroller-polyfill
    }
  ),
});
```

Then, you can start using Fetch API config in your requests actions. For example,
in order to create Fetch API requests, below:
```js
fetch('/users', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
  },
});
```
should be translated to this request action:
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
The point is, you can use the same request config like you do with pure Fetch API.
The only difference is that you need to pass `url` in the config itself.

Also, one additional parameter you could provide in the config is `responseType`, which is set as `json`
by default. Available response types are: `'arraybuffer'`, `'blob'`, `'formData'`, `'json'`, `'text'`, or `null`
(if you don't want a response stream to be read for the given response).

Moreover, as you probably deducted from `responseType` option in config, this driver reads response streams automatically for you (depending on `responseType` you choose) and sets it as `response.data`, so instead of doing `response.json()`, just read `response.data`.
