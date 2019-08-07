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
state from `networkReducer` or `requestsReducer` instances inside React components. It provides the following components:

### `Query`

`Query` simplifies rendering server responses, spinners and server errors.
It has the following props:
- `query` - a state from a `requestsReducer`
- `children` - a React node or render function receiving `query` object, render function has the advantage
that it gets called only when `query.data` is present, so you don't need to do checks like `data && data.length > 0`
- `component` - alternative prop to `children`, you can pass your custom component here, which will receive `query` prop, plus any external props passed to `Query`
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

<Query query={query}>
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
  query={query}
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
  query={query}
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

### `ConnectedQuery`

Wrapper around `Query`, it has the same purpose, but instead of passing
`query` prop, you pass `requestSelector` or `type` when using `networkReducer`. Then, you don't need to worry about
using `connect` from `react-redux`, `ConnectedQuery` will do it automatically
for you. Of course you can pass other `Query` props like `isDataEmpty`.
```js
import { ConnectedQuery } from 'redux-saga-requests-react';

<ConnectedQuery
  requestSelector={state => state.request}
  // or type={REQUEST_TYPE}
>
  {({ data }) => (
    <div>
      {data}
    </div>
  )}
</ConnectedQuery>
```

### `Mutation`

`Mutation` is a small syntactic sugar component and can be used when you use
mutations in `requestsReducer` or in actions with `networkReducer` and for example you want to show loading state
for a button or an mutation error message. It has the following props:
- `mutation` - a mutation substate from a `requestsReducer` or `networkReducer`
- `children` - render function receiving object with `loading` flag and `error` property
- `component` - alternative prop to `children`, you can pass your custom component here, which will receive `loading` and `error` props, plus any external props passed to `Mutation`
- `requestKey: string`: only necessary if you defined `getRequestKey` in a mutation,
usually it will be some kind of id

You use it like this:
```js
import { Mutation } from 'redux-saga-requests-react';

<Mutation mutation={request.mutations[MUTATION_TYPE]}>
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

### `ConnectedMutation`

`ConnectedMutation` is a wrapper around `Mutation`. It has automatic
state Redux connection capabilities, thanks to below additional props:
- `type: string`: Redux action type of corresponding mutation action
- `requestSelector`: (only if you use `requestsReducer`, for `networkReducer` `type` is all you need) selector to get state of `requestsReducer`, the same you would use
in `ConnectedQuery`, pass it instead of `mutation` to avoid connecting to Redux manually

Here is how you use it:
```js
import { ConnectedMutation } from 'redux-saga-requests-react';

<ConnectedMutation
  requestSelector={state => state.request}
  type={MUTATION_TYPE}
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
</ConnectedMutation>
```

## Licence

MIT
