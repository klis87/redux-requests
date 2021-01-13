---
title: Using drivers
description: Using drivers guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## What is driver?

You must have noticed by now that this library uses a concept called **drivers**.
So what is driver exactly? Technically, driver is just a function, which receives a request config,
sends an AJAX request and returns a promise, which will be resolved for success case and
rejected for error or abort cases. Practically, driver is an abstraction, a way to use this library
with any way to communicate with servers. Some people like Axios, other Fetch API. Some people like
REST, other prefer GraphQL. Thanks to drivers concept you can use anything, even in combination in one app -
that's it, it is possible to use multiple drivers at the same time! Anyway, this library
provides many built-in drivers, but it is also possible to write your own, which
will be covered later in this chapter.

## How to use drivers

You must use at least one driver. You can choose one of provided drivers by this library
or write your own. Let's assume we pick `fetch` driver. Install it:

```bash
$ npm install @redux-requests/fetch
```

and pass it to `handleRequests`:

```js
import 'isomorphic-fetch';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/fetch';

handleRequests({
  driver: createDriver(window.fetch, {
    baseURL: 'https://my-domain.com',
    AbortController: window.AbortController,
  }),
});
```

And that's it, `fetch` driver is ready to use and the library will understand
`Fetch API` config in request actions.

## Multiple drivers

You can use multiple drivers at the same time if you need it. For example, if you want to use Axios by default, but also Fetch API
sometimes, you can do it like this:

```js
import axios from 'axios';
import 'isomorphic-fetch';
import { handleRequests } from '@redux-requests/core';
import { createDriver as createAxiosDriver } from '@redux-requests/axios';
import { createDriver as createFetchDriver } from '@redux-requests/fetch';

handleRequests({
  driver: {
    default: createAxiosDriver(axios),
    fetch: createFetchDriver(window.fetch, {
      baseURL: 'https://my-domain.com',
      AbortController: window.AbortController,
    }),
  },
});
```

As you can see, the default driver is Axios, so how to mark a request to be run by Fetch driver?
Just pass the key you assigned Fetch driver to (`fetch` in our case) in `action.meta.driver`, for instance:

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
  },
  meta: {
    driver: 'fetch',
  },
});
```

## Writing your own driver

As mentioned earlier, driver is just a function, which receives a request config,
sends an AJAX request and returns a promise, which will be resolved for success case and rejected for error or abort cases.

So, let's write `axios` driver. In order to understand what will happen next, it is recommended
to get familiar with `axios` library, especially how to abort requests. Anyway, let's start some coding:

```js
import axios from 'axios';

const axiosDriver = requestConfig => {
  return axios(requestConfig).then(response => ({ data: response.data }));
};
```

Well, it wasn't so difficult, was it? As we can see, we just wrote a function
which get's `requestConfig` (it will be passed from `action.request`) and returns
called `axios` with it. `axios(requestConfig)` already returns a promise which will
be rejected for error, so we are good here. The only thing we did is adding
`.then(response => ({ data: response.data }))` to resolve promises only with `data` -
the library expects promises to be resolved with object with at least `data`.

## Supporting more than just data

As written above, for success response promise has to be resolved with an object
with at least `data` key, but you can add anything else:

```js
import axios from 'axios';

const axiosDriver = requestConfig => {
  return axios(requestConfig).then(response => ({
    data: response.data,
    headers: response.headers,
    status: response.status,
  }));
};
```

Now `headers` and `status` will be available in `onSuccess` interceptor and in
promise which is returned by request action dispatch (next to `data`). However,
note that still only `data` will be stored in reducer, so if you need to access a header
for instance from Redux state, you can store it in your own reducer or you could merge
a header with `data` inside `onSuccess` interceptor.

## Supporting aborts in custom drivers

We are not done yet though, our driver does not support aborts yet, let's fix that:

```js
import axios from 'axios';

const axiosDriver = requestConfig => {
  const abortSource = axios.CancelToken.source();

  const responsePromise = axios({
    cancelToken: abortSource.token,
    ...requestConfig,
  })
    .then(response => ({
      data: response.data,
      headers: response.headers,
      status: response.status,
    }))
    .catch(error => {
      if (axios.isCancel(error)) {
        throw 'REQUEST_ABORTED';
      }

      throw error;
    });

  responsePromise.cancel = () => abortSource.cancel();
  return responsePromise;
};
```

This looks a little more complicated, but it is not, let's analyze above code steps
by steps. First of all, to support abort we decorated returned promise with `cancel`
method, which will be called by the library when a request should be aborted. Native
promises cannot be aborted/cancelled, but by adding this we make it possible. This technique
is quite similar for example to `Bluebird` promises. Moreover, notice `catch` logic.
This uses `axios` helper to check whether request promise was rejected due to abort
or another error, and in case of abort, we throw special error `REQUEST_ABORTED`, so that
the library can know that promise was rejected due to cancellation. This is needed because
we need to handle 3 response types - success, error or abort, while promise can be just
resolved or rejected. We could also use observables instead of promises as building blocks
for drivers, but they are less popular than promises and they require libraries/polyfills installed.
Hence the decision for such API. Also, you need to remember not to use async function!
If you do, javascript engine would wrap your returned promise and `.cancel` method would be gone!
So resist the temptation and stick just to promises when writing drivers!

## Making your driver configurable

Most of the time you would probably want your driver to be configurable. For instance,
we might want to allow to pass a custom `axios` instance to `axios` driver. So let's refactor what we have:

```js
import axios from 'axios';

const createAxiosDriver = axiosInstance => requestConfig => {
  const abortSource = axios.CancelToken.source();

  const responsePromise = axiosInstance({
    cancelToken: abortSource.token,
    ...requestConfig,
  })
    .then(response => ({
      data: response.data,
      headers: response.headers,
      status: response.status,
    }))
    .catch(error => {
      if (axios.isCancel(error)) {
        throw 'REQUEST_ABORTED';
      }

      throw error;
    });

  responsePromise.cancel = () => abortSource.cancel();
  return responsePromise;
};
```

Now we could create driver with a configured axios, like:

```js
import axios from 'axios';

const axiosDriver = createAxiosDriver(
  axios.create({
    baseURL: 'https://some-domain.com/api/',
  }),
);
```

So basically we refactored `axiosDriver` into `createAxiosDriver` - function which
returns `axiosDriver`. This technique is of course not mandatory but it might be handy
to make your drivers more flexible.

## Supporting download and upload progress

Optionally drivers could support download and upload progress. Because `axios` makes it easy with the help of
[ProgressEvent](https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent), let's see how we could implement it:

```js
import axios from 'axios';

const calculateProgress = progressEvent =>
  parseInt((progressEvent.loaded / progressEvent.total) * 100);

const createAxiosDriver = axiosInstance => (
  requestConfig,
  requestAction,
  driverActions,
) => {
  const abortSource = axios.CancelToken.source();

  const responsePromise = axiosInstance({
    cancelToken: abortSource.token,
    onDownloadProgress:
      driverActions.setDownloadProgress &&
      (progressEvent => {
        if (progressEvent.lengthComputable) {
          driverActions.setDownloadProgress(calculateProgress(progressEvent));
        }
      }),
    onUploadProgress:
      driverActions.setUploadProgress &&
      (progressEvent => {
        if (progressEvent.lengthComputable) {
          driverActions.setUploadProgress(calculateProgress(progressEvent));
        }
      }),
    ...requestConfig,
  })
    .then(response => ({
      data: response.data,
      headers: response.headers,
      status: response.status,
    }))
    .catch(error => {
      if (axios.isCancel(error)) {
        throw 'REQUEST_ABORTED';
      }

      throw error;
    });

  responsePromise.cancel = () => abortSource.cancel();
  return responsePromise;
};
```

As you can see, you could utilise `driverActions` helpers which are passed to any driver. We use them in
`axios` `onDownloadProgress` and `onUploadProgress` callbacks. After adding this, you could add `meta.measureDownloadProgress`
or `meta.measureUploadProgress` to a request action and you could access `downloadProgress` or `uploadProgress` values from selectors like `getQuery` or `getMutation`.
