---
title: Installation
---

## Installing the core

Before installing `redux-requests`, first make sure that you have installed required
dependencies:
```bash
$ npm install redux reselect
```

Then, to install the package, just run:
```bash
$ npm install @redux-requests/core
```
or you can just use CDN: `https://unpkg.com/@redux-requests/core`.

## Installing a driver

Also, you need to install a driver. There are following drivers available:
- axios
- fetch
- graphql
- promise
- mock

You need to have at least one, but it is also possible to use multiple in the single
app. It is also possible to write a custom driver.

### Axios

Choose it, if you like using `axios` library. To install it, run:
```bash
$ npm install @redux-requests/axios
```
or CDN: `https://unpkg.com/@redux-requests/axios`

`axios` itself is not included in the driver, so you will need to install it separately:
```bash
$ npm install axios
```

### Fetch

Choose it, if you prefer to use the standard Fetch API to communicate with your servers:
```bash
$ npm install @redux-requests/fetch
```
or CDN: `https://unpkg.com/@redux-requests/fetch`.

You might also need to install a Fetch API polyfill if your environment requires it,
for instance `isomorphic-fetch`:
```bash
$ npm install isomorphic-fetch
```

### GraphQL

Use it, if you need to connect to a GraphQL server. In theory it is of course possible to
use `axios` or `fetch` driver for this, but `graphql` driver makes this simpler and supports
GraphQL concepts like fragments, uploading files according to [multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec) and so on. To install it, run:
```bash
$ npm install @redux-requests/graphql
```
or CDN: `https://unpkg.com/@redux-requests/graphql`.

### Promise

Sometimes you already have a library which is responsible for API communication.
Usually those are promised based. For this scenario, pick `promise` driver:
```bash
$ npm install @redux-requests/promise
```
or CDN: `https://unpkg.com/@redux-requests/promise`.

### Mock

In a perfect world, you would always already have an API to integrate with during frontend
development. However, quite often reality proves otherwise and you would like to
start working on a feature before backend is ready. In this situation `mock` driver
could be very useful, as with its help you can just mock server responses and errors within
Redux actions and continue normally. Then, after API is finished, you will just need to replace
the driver with a real one, like `axios` or `fetch`, without any additional refactoring necessary,
which could save you a lot of time! To install:
```bash
$ npm install @redux-requests/mock
```
or CDN: `https://unpkg.com/@redux-requests/mock`.


