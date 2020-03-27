---
id: installation
title: Installation
---

To install the package, just run:

```bash
npm install redux-saga-requests
```

or you can just use CDN: `https://unpkg.com/redux-saga-requests`.

Also, you need to install a driver:

- if you use Axios, install `axios` and `redux-saga-requests-axios`:

  ```bash
  npm install axios redux-saga-requests-axios
  ```

  or CDN: `https://unpkg.com/redux-saga-requests-axios`.
- if you use Fetch API, install `isomorphic-fetch` (or a different Fetch polyfill) and `redux-saga-requests-fetch`:

  ```bash
  npm install isomorphic-fetch redux-saga-requests-fetch
  ```

  or CDN: `https://unpkg.com/redux-saga-requests-fetch`.

Of course, because this is Redux-Saga addon, you also need to install [**redux-saga**](https://redux-saga.js.org/).
Also, it requires to install [**reselect**](https://github.com/reduxjs/reselect).
