---
title:  Usage with React
description: React guide for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

## Introduction

This library is just a Redux addon, so you can use it with any UI library, like React,
Angular, Vue - whatever will work with Redux will work. However, you might consider using
some React helpers which will be described below.

## Installation

To install the package, just run:
```bash
$ npm install @redux-requests/react
```
or you can just use CDN: `https://unpkg.com/@redux-requests/react`.

```bas
$ npm install react-redux
```

## Usage

### `useQuery`

`useQuery` is a hook which uses `useSelector` from `react-redux` together with `getQuerySelector` from
`redux-requests/core`. It accepts the same arguments as `getQuerySelector`. You could
easily use `useSelector` directly, but `useQuery` is slightly less verbose. So, without `useQuery`:
```js
import React from 'react';
import { getQuerySelector } from '@redux-requests/core';
import { useSelector } from 'react-redux';

const Books = () => {
  const books = useSelector(getQuerySelector({ type: 'FETCH_BOOKS' }))
  // ...
};
```

and with `useQuery`:
```js
import React from 'react';
import { useQuery } from '@redux-requests/react';

const Books = () => {
  const books = useQuery({ type: 'FETCH_BOOKS' })
  // ...
};
```

### `Query`

`Query` simplifies rendering queries data, loading spinners and server errors. It automatically connects to Redux store by using `useQuery` under the hood. It has the following props:
- `type: string`: type of query action, refer to `getQuery` from the core library
- `requestKey: string`: pass it if you used `requestKey` in query action, refer to `getQuery` from the core library
- `multiple: boolean`: refer to `getQuery` from the core library
- `defaultData`: refer to `getQuery` from the core library
- `selector`: if you already have a query selector, pass it here instead of `type`
- `children` - render function receiving object with data, loading flag and error property
- `component` - alternative prop to children, you can pass your custom component here, which will receive data,  loading and error props, plus any additional props passed to `Query`
- `isDataEmpty: query => boolean`: function which defines when `data` is empty, by default data as empty array and falsy value like `null`, `undefined` is considered as empty
when data is updated - it will still show during initial fetch, but ill not for subsequent requests
- `noDataMessage`: `string` or any React node, like `<div>message</div>`, which will be rendered when `data` is empty
- `errorComponent`: custom React component, which will be rendered on error, receives `error` prop, `null` by default
- `errorComponentProps`: extra props which will be passed to `errorComponent`
- `loadingComponent` custom React component, which will be rndered when request is pending, useful for showing
- `loadingComponentProps`: extra props which will be passed to `loadingComponent`
spinners, `null` by default
- `showLoaderDuringRefetch: boolean`: `true` by default, whether `loadingComponent` will be shown on data refetch
or not, if `false` you won't see spinner even when data is being loaded if you already have some data from a previous requests

Minimalistic example:
```js
import { Query } from '@redux-requests/react';

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
import { Query } from '@redux-requests/react';

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
import { Query } from '@redux-requests/react';

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
`redux-requests`. It accepts the same arguments as `getMutationSelector`. Like in case of `useQuery`, you could
render

For example:
```js
import React from 'react';
import { useMutation } from '@redux-requests/react';

const Books = () => {
  const { loading, error } = useMutation({ type: 'DELETE_BOOK' })
  // ...
};
```

### `Mutation`

`Mutation` converts `useMutation` into component with render prop. It has the following props:
- `type: string`: type of mutation action, refer to `getMutation` from the core library
- `requestKey: string`: pass it if you used `requestKey` in mutation action, refer to `getMutation` from the core library
- `selector`: if you already have a mutation selector, pass it here instead of type
- `children` - render function receiving object with loading flag and error property
- `component` - alternative prop to children, you can pass your custom component here, which will receive loading and error props, plus any additional props passed to Mutation

You use it like this:
```js
import { Mutation } from '@redux-requests/react';

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
