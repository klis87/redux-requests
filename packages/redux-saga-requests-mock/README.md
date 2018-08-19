# redux-saga-requests-mock

[![npm version](https://badge.fury.io/js/redux-saga-requests-mock.svg)](https://badge.fury.io/js/redux-saga-requests-mock)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Mock driver to Redux-Saga - addon to simplify handling of AJAX requests.


## Installation

To install the package, just run:
```
$ yarn add redux-saga-requests-mock
```
or...
```
$ npm install redux-saga-requests-mock
```
or you can just use CDN: `https://unpkg.com/redux-saga-requests-mock`.

## Usage

Probably you are sometimes in a situation when you would like to start working on a feature which needs some integration with
an API. What you can do then? Probably you just wait or start writing some prototype which then you will polish once API is finished. You can do better with `redux-saga-requests-mock`, especially with multi driver support, which you can read about in the
next paragraph. With this driver, you can define expected responses and errors which you would get from server and write your app
normally. Then, after API is finished, you will just need to replace the driver with a real one, like Axios or Fetch API, without
any additional refactoring necessary, which could save you a lot of time!

You can use it like this:
```js
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-mock';

const FETCH_PHOTO = 'FETCH_PHOTO';

const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

function* rootSaga() {
  yield createRequestInstance({
    driver: createDriver(
      {
        [FETCH_PHOTO]: requestConfig => {
          // mock normal response for id 1 and 404 error fot the rest
          const id = requestConfig.url.split('/')[2];

          if (id === '1') {
            return {
              data: {
                albumId: 1,
                id: 1,
                title: 'accusamus beatae ad facilis cum similique qui sunt',
              },
            };
          }

          throw { status: 404 };
        },
      },
      {
        timeout: 1000, // optional, in ms, defining how much time mock request would take, useful for testing spinners
        getDataFromResponse: response => response.data // optional, if you mock Axios or Fetch API, you dont need to worry about it
      },
    ),
  });
  yield watchRequests();
}
```

## Licence

MIT
