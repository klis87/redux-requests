# redux-saga-requests-react

[![npm version](https://badge.fury.io/js/redux-saga-requests-react.svg)](https://badge.fury.io/js/redux-saga-requests-react)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

React bindings for Redux-Saga-Requests, Redux-Saga addon to simplify AJAX requests

## Installation

To install the package, just run:
```
$ yarn add redux-saga-requests-react
```
or...
```
$ npm install redux-saga-requests-react
```
or you can just use CDN: `https://unpkg.com/redux-saga-requests-react`.

For general usage, see [redux-saga-requests docs](https://github.com/klis87/redux-saga-requests).

## Purpose

This library is totally optional, but it reduces boilerplate of using `react-saga-requests`
state inside React components. It provides the following hooks and components:

### `useQuery`

`useQuery` is a hook which uses `useSelector` from `react-redux` together with `getQuerySelector` from
`redux-saga-requests`. It accepts the same arguments as `getQuerySelector`. You could
easily use `useSelector` directly, but `useQuery` is slightly less verbose. So, without `useQuery`:
```js
import React from 'react';
import { getQuerySelector } from 'redux-saga-requests';
import { useSelector } from 'react-redux';

const Books = () => {
  const books = useSelector(getQuerySelector({ type: 'FETCH_BOOKS' }))
  // ...
};
```

and with `useQuery`:
```js
import React from 'react';
import { useQuery } from 'redux-saga-requests-react';

const Books = () => {
  const books = useQuery({ type: 'FETCH_BOOKS' })
  // ...
};
```

### `Query`

`Query` simplifies rendering queries data, loading spinners and server errors. It automatically connects to Redux store
by using `useQuery` under the hood. It has the following props:
- `type: string`: refer to `getQuery` form the core library
- `selector`: if you already have a query selector, pass it here instead of `type`
- `multiple`: refer to `getQuery`
- `defaultObject`: refer to `getQuery`
- `children` - render function receiving `query` object, called when data is not empty according to `isDataEmpty` prop
- `component` - alternative prop to `children`, you can pass your custom component here, which will receive `query` prop, plus any additional props passed to `Query`
- `isDataEmpty: query => boolean`: function which defines when `data` is empty, by default data as empty array and falsy value like `null`, `undefined` is considered as empty
- `showLoaderDuringRefetch: boolean`: `true` by default, change it to `false` if you don't want to show spinner
when data is updated - it will still show during initial fetch, but will not for subsequent requests
- `noDataMessage`: `string` or any React node, like `<div>message</div>`, which will be rendered when `data` is empty
according to `isDataEmpty` function, `null` by default
- `errorComponent`: custom React component, which will be rendered on error, receives `error` prop, `null` by default
- `errorComponentProps`: object of additional props passed to `errorComponent`
- `loadingComponent` custom React component, which will be rendered when request is pending, useful for showing
spinners, `null` by default
- `loadingComponentProps`: object of additional props passed to `loadingComponent`

Minimalistic example:
```js
import { Query } from 'redux-saga-requests-react';

<Query
  type={REQUEST_TYPE}
  // or selector={myQuerySelector}
>
  {({ data }) => (
    <div>
      {data}
    </div>
  )}
</Query>
```
or with `component` prop:
```js
import { Query } from 'redux-saga-requests-react';

const DataComponent = ({ query, extraLabelProp }) => (
  <div>
    <h1>{extraLabelProp}</h1>
    {query.data}
  </div>
);

<Query
  type={REQUEST_TYPE}
  // or selector={myQuerySelector}
  component={DataComponent}
  extraLabelProp="label"
/>
```
or with all props:
```js
import { Query } from 'redux-saga-requests-react';

const LoadingComponent = ({ label }) => (
  <div>
    ...loading
    {label}
  </div>
);

const ErrorComponent = ({ error, label }) => (
  <div>
    Error with status code {error.status}
    {label}
  </div>
);

<Query
  type={REQUEST_TYPE}
  // or selector={myQuerySelector}
  isDataEmpty={query =>
    Array.isArray(query.data) ? query.data.length === 0 : !query.data}
  showLoaderDuringRefetch={false}
  noDataMessage="There is no data"
  errorComponent={ErrorComponent}
  errorComponentProps={{ label: 'Error label' }}
  loadingComponent={LoadingComponent}
  loadingComponentProps={{ label: 'Loading label' }}
>
  {({ data }) => (
    <div>
      {data}
    </div>
  )}
</Query>
```

### `useMutation`

`useMutation` is a hook which uses `useSelector` from `react-redux` together with `getMutationSelector` from
`redux-saga-requests`. It accepts the same arguments as `getMutation`. Like in case of `useQuery`, you could
easily use `useSelector` directly, but then you would need to remember not to recreate selector during each
render.

For example:
```js
import React from 'react';
import { useMutation } from 'redux-saga-requests-react';

const Books = () => {
  const { loading, error } = useMutation({ type: 'DELETE_BOOK' })
  // ...
};
```

### `Mutation`

`Mutation` Converts `useMutation` into component with render prop. It has the following props:
- `type: string`: refer to `useMutation`
- `selector`: if you already have a mutation selector, pass it here instead of `type`
- `requestKey: string`: refer to `useMutation`
- `children` - render function receiving object with `loading` flag and `error` property
- `component` - alternative prop to `children`, you can pass your custom component here, which will receive `loading` and `error` props, plus any additional props passed to `Mutation`

You use it like this:
```js
import { Mutation } from 'redux-saga-requests-react';

<Mutation
  type={MUTATION_TYPE}
  // or selector={myMutationSelector}
>
  {({ loading, error }) => {
    if (error) {
      return <div>Something went wrong</div>;
    }

    return (
      <button onClick={dispatchSomeMutation} disabled={loading}>
        Send mutation {loading && '...' }
      </button>
    );
  }}
</Mutation>
```

## Licence

MIT
