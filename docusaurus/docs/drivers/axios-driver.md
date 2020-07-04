---
title:  Axios driver
---

## Introduction

Choose `axios` driver is if you like using [axios](https://github.com/axios/axios) library to make AJAX requests.
If you know `axios`, you already know how to use it as the driver.

## Installation

First, install the driver:
```bash
$ npm install  @redux-requests/axios
```
or you can just use CDN: `https://unpkg.com/@redux-requests/axios`.

## Usage

Before you can use `axios` driver, first pass it to `handleRequests`:
```js
import 'axios' from axios;
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';

handleRequests({
  driver: createDriver(axios),
});
```

As you can see, `createDriver` accepts just one argument, an `axios` instance.
You can pass just `axios` here, but you can also pass a configured instance, for example
`createDriver(axios.create({ baseURL: 'https://some-domain.com/api/' }))`

Then, you can start using it by just using `axios` config in your requests actions. For example:
```js
axios({
  url: '/users/1',
  method: 'delete',
});
```
should be translated to this request action:
```js
const deleteUser = id => ({
  type: 'DELETE_USER',
  request: {
    url: `/users/${id}`,
    method: 'delete',
  }
});
```
The point is, you can use the same request config like you do with pure Axios. That's
all there is to it. For any options just refer to [axios docs](https://github.com/axios/axios).
