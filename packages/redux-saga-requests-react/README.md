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
state from `requestsReducer` instances inside React component. It provides the following components:

### `RequestContainer`

`RequestContainer` simplifies rendering server responses, spinners and server errors.
It has the following props:
- `request` - a state from a `requestsReducer`
- `children` - a React node or render function receiving `request` object, render function has the advantage
that it gets called only when `request.data` is present, so you don't need to do checks like `data && data.length > 0`
- `component` - alternative prop to `children`, you can pass your custom component here, which will receive `request` prop, plus any external props passed to `RequestContainer`
- `isDataEmpty: request => boolean`: function which defines when `data` is empty, by default data as empty array and falsy value like `null`, `undefined` is considered as empty
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
import { RequestContainer } from 'redux-saga-requests-react';

<RequestContainer request={request}>
  {({ data }) => (
    <div>
      {data}
    </div>
  )}
</RequestContainer>
```
or with `component` prop:
```js
import { RequestContainer } from 'redux-saga-requests-react';

const DataComponent = ({ request, extraLabelProp }) => (
  <div>
    <h1>{extraLabelProp}</h1>
    {request.data}
  </div>
);

<RequestContainer
  request={request}
  component={DataComponent}
  extraLabelProp="label"
/>
```
or with all props:
```js
import { RequestContainer } from 'redux-saga-requests-react';

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

<RequestContainer
  request={request}
  isDataEmpty={request =>
    Array.isArray(request.data) ? request.data.length === 0 : !request.data}
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
</RequestContainer>
```

### `ConnectedRequestContainer`

Wrapper around `RequestContainer`, it has the same purpose, but instead of passing
`request` prop, you pass `requestSelector`. Then, you don't need to worry about
using `connect` from `react-redux`, `ConnectedRequestContainer` will do it automatically
for you:
```js
import { ConnectedRequestContainer } from 'redux-saga-requests-react';

<ConnectedRequestContainer requestSelector={state => state.request}>
  {({ data }) => (
    <div>
      {data}
    </div>
  )}
</ConnectedRequestContainer>
```

### `OperationContainer`

`OperationContainer` is a small syntactic sugar component and can be used when you use
operations in `requestsReducer` and for example you want to show loading state
for a button or an operation error message. It has the following props:
- `operation` - an operation substate from a `requestsReducer`
- `children` - render function receiving object with `loading` flag and `error` property
- `component` - alternative prop to `children`, you can pass your custom component here, which will receive `loading` and `error` props, plus any external props passed to `OperationContainer`
- `requestKey: string`: only necessary if you defined `getRequestKey` in `requestsReducer` operation,
usually it will be some kind of id

You use it like this:
```js
import { OperationContainer } from 'redux-saga-requests-react';

<OperationContainer operation={request.operations[OPERATION_TYPE]}>
  {({ loading, error }) => {
    if (error) {
      return <div>Something went wrong</div>;
    }

    return (
      <button onClick={dispatchSomeOperation} disabled={loading}>
        Send operation {loading && '...' }
      </button>
    );
  }}
</OperationContainer>
```

### `ConnectedOperationContainer`

`ConnectedOperationContainer` is a wrapper around `OperationContainer`. It has automatic
state Redux connection capabilities, thanks to below additional props:
- `requestSelector`: selector to get state of `requestsReducer`, the same you would use
in `ConnectedRequestContainer`, pass it instead of `operation` to avoid connecting to Redux manually
- `operationType: string`: Redux action type of corresponding operation action,
used together with `requestSelector`
- `operationCreator`: optional, Redux action creator object describing a given operation,
`ConnectedOperationContainer` will put it to `mapDispatchToProps` for you and pass ready to dispatch operation as
additional prop `sendOperation` to `children` callback. As a bonus, if you use
libraries like `redux-act` or `redux-actions`, `operationCreator.toString()` actually returns
action type, so you don't need to pass `operationType` together with `operationCreator` then!

Here is how you use it:
```js
import { ConnectedOperationContainer } from 'redux-saga-requests-react';

const OPERATION_TYPE = 'OPERATION_TYPE';

const Operation = () => ({
  type: OPERATION_TYPE,
  request: {
    url: '/url',
    method: 'post',
  },
})

<ConnectedOperationContainer
  requestSelector={state => state.request}
  operationType={OPERATION_TYPE}
  operationCreator={Operation}
>
  {({ loading, error, sendOperation }) => {
    if (error) {
      return <div>Something went wrong</div>;
    }

    return (
      <button onClick={sendOperation} disabled={loading}>
        Send operation {loading && '...' }
      </button>
    );
  }}
</ConnectedOperationContainer>
```

## Licence

MIT
