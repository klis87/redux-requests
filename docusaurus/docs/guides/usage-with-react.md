---
title: Usage with React
description: React guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
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
  const books = useSelector(getQuerySelector({ type: 'FETCH_BOOKS' }));
  // ...
};
```

and with `useQuery`:

```js
import React from 'react';
import { useQuery } from '@redux-requests/react';

const Books = () => {
  const { data, error, loading, pristine } = useQuery({ type: 'FETCH_BOOKS' });
  // ...
};
```

As you can see, `useQuery` hook is a convenient way to read query state, however it is much more powerful than that, it supports:

- automatic queries reset and abort on component unmount
- automatic query load - that's it, it can dispatch query action automatically for you on component mount
- suspense support
- server side suspense support for SSR - see [this guide](/docs/guides/server-side-rendering#react-suspense) for more information
- throwing errors instead of rendering to catch them up by a React error boundary component

Above can be configured with extra props:

- `autoLoad: boolean` - default `false`, if `true`, then query action will be dispatched on component mount automatically, also,
  query will be dispatched again on `type` or `requestKey` change, as well as on `variables` change, be aware that in order for this to work, you need to pass `variables` and `action` props (see below)
- `variables` - required when `autoLoad` is `true` (or you want to use `load` callback) and your query action accepts variables, you need to pass them as array, for example
  `variables={['firstVariable', 2, 'thirdVariable']}`, note that query will be refetched on any variable change, so you must pay attention
  if any of your variables is an object - if yes, it must be memoized, for example by `useMemo`, otherwise query would be refetched on
  every render
- `action` - necessary if `autoLoad` is `true` (or you want to use `load` callback) and `type` is `string` (so you don't use Redux action creator library and you have constants)
- `autoReset: boolean`: `false` by default, setting to `true` will reset query on component unmount, be adviced though that it won't
  reset queries which are cached, also nothing will be reset on unmount if there is any other active component with another `useQuery` of the same type
- `suspense: boolean`: `false` by default, setting to `true` will activate suspense, which will need to be catched by a `Suspense` component
- `throwError: boolean`: `false` by default, setting to `true` will throw error on query error, ready to be catched by a React error boundary component
- `suspenseSsr: boolean`: `false` by default, set it to `true` if you want to use suspense for SSR, typically you won't do it in every `useQuery` but in `RequestsProvider` globally

To get some more ideas how to use it, see below example:

```jsx
const fetchBook = id => ({
  type: 'FETCH_BOOK',
  request: { url: `/books/${id}` },
});

const Book = () => {
  const {
    data,
    error,
    loading,
    pristine,
    load, // callback to dispatch this query action any time
    stopPolling, // callback to stop polling for this query action, if set
  } = useQuery({
    type: 'FETCH_BOOK',
    action: fetchBook,
    variables: [1],
    autoLoad: true,
    autoReset: true,
    suspense: true,
    throwError: true,
  });
  // ...
};
```

Note, that unconvenient `action` won't be necessary if you use an action creator library.

### `useMutation`

`useMutation` is a hook which uses `useSelector` from `react-redux` together with `getMutationSelector` from
`redux-requests`. It accepts the same arguments as `getMutationSelector`. Like in case of `useQuery`, you could
render

For example:

```js
import React from 'react';
import { useMutation } from '@redux-requests/react';

const Books = () => {
  const { loading, error } = useMutation({ type: 'DELETE_BOOK' });
  // ...
};
```

Like in case of `useQuery`, `useMutation` also accepts some extra props:

- `variables` - required when you want to use `mutate` callback) and your mutation action accepts variables, you need to pass them as array, for example
  `variables={['firstVariable', 2, 'thirdVariable']}`
- `action` - necessary if you want to use `mutate` callback and `type` is `string` (so you don't use Redux action creator library and you have constants)
- `autoReset: boolean`: `false` by default, setting to `true` will reset mutation on component unmount, be adviced that nothing will be reset on unmount if there is any other active component with another `useMutation` of the same type
- `suspense: boolean`: `false` by default, setting to `true` will activate suspense, which will need to be catched by a `Suspense` component
- `throwError: boolean`: `false` by default, setting to `true` will throw error on mutation error, ready to be catched by a React error boundary component

To get some more ideas how to use it, see below example:

```jsx
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: { url: `/books/${id}`, method: 'delete' },
});

const Book = () => {
  const {
    error,
    loading,
    pristine,
    mutate, // callback to dispatch this mutation action any time
  } = useQuery({
    type: 'DELETE_BOOK',
    action: deleteBook,
    variables: [1],
    autoReset: true,
    suspense: true,
    throwError: true,
  });
  // ...
};
```

### `RequestsProvider`

This component is only necessary for SSR with suspense, but it is recommended to use it in any case, as it can change default values like `autoReset` for `useQuery` and `useMutation` hooks and optionally setup Redux store for you. It is actually a wrapper around
`Provider` from `react-redux`, so you shouldn't use both, if you use `RequestsProvider`, don't use `Provider`.

`RequestsProvider` accepts the following props:

- `children`: required, any React element, probably top level of you app
- `requestsConfig`: the very same config you would pass to `handleRequest` from `@redux-requests/core`, not needed if you pass your
  own `store`
- `extraReducers`: optional, object of your custom reducers which will be merged with `requestsReducer`, not needed if you pass
  your own `store`
- `getMiddleware`: optional, here you can pass extra Redux middleware, for example `getMiddleware={requestsMiddleware => [thunkMiddleware, ...requestsMiddleware]}`, not needed if you pass your own `store`
- `store`: your store instance, pass it if you would like to create Redux store on your own
- `suspense: boolean`: default to `false`, this value will be the default value for all `useQuery` and `useMutation` hooks
- `autoLoad: boolean`: default to `false`, this value will be the default value for all `useQuery` hooks
- `autoReset: boolean`: default to `false`, this value will be the default value for all `useQuery` and `useMutation` hooks
- `throwError: boolean`: default to `false`, this value will be the default value for all `useQuery` and `useMutation` hooks
- `suspenseSsr: boolean`: default to `false`, set to `true` when using suspense SSR
- `getStore`: function called on `RequestsProvider` mount, it allows you to get access to `store` created by `RequestsProvider`, typically
  used in suspense SSR scenario
- `initialState`: initial state for store created by `RequestsProvider`, not needed when passing your own `store`, typically only for SSR scenario

Simple example:

```jsx
import axios from 'axios';
import { RequestsProvider } from '@redux-requests/react';
import { createDriver } from '@redux-requests/axios';

<RequestsProvider
  requestsConfig={{
    driver: createDriver(
      axios.create({
        baseURL: 'http://localhost:3000',
      }),
    ),
  }}
  autoReset
>
  <App />
</RequestsProvider>;
```

### `RequestsErrorBoundary`

This is a ready to use error boundary component to catch errors from `useQuery` and `useMutation` hooks, when using `throwErrow: true`.
It has a convenient ability to recover from error if catched error is fixed, for example by a query refetch.

It has the following props:

- `type`: required, a type of a query or a mutation which you want to catch error for
- `requestKey`: like above, required when you use a request with `requestKey`
- `autoReset: boolean`: like for `useQuery` and `useMutation`, whether request should be reset on unmount
- `children`: React element with `useQuery` or `useMutation` hook, for which you want to catch errors
- `fallback`: render prop with error to render

Simple example:

```jsx
import { RequestsErrorBoundary } from '@redux-requests/react';

<RequestsErrorBoundary
  type="FETCH-BOOK"
  autoReset
  fallback={error => <div>Some error happened during books loading</div>}
>
  <Book />
</RequestsErrorBoundary>;
```

### `useDispatchRequest`

Alias for `useDispatch` from `react-redux`, it works the same but it improves Typescript experience:

```jsx
import { useDispatchRequest } from '@redux-requests/react';

const BookFetcher = () => {
  const dispatchRequest = useDispatchRequest();

  return (
    <button
      onClick={async () => {
        const { data, error } = await dispatch(fetchBook('1'));
      }}
    >
      Fetch book
    </button>
  );
};
```

See [this guide](/docs/guides/usage-with-typescript#usage-with-react) for more information.

### `Query`

`Query` is render prop alternative to `useQuery` hook. However, for now this component is not in par with `useQuery`.
It can be only used to read query state, not to automatically load queries and so on. For that, use either `useQuery`
or create your own render prop component basing on `useQuery`. Time will tell whether `Query` will be deprecated or
will match all `useQuery` functionality.

Anyway, `Query` has the following props:

- `type: string`: type of query action, refer to `getQuery` from the core library
- `requestKey: string`: pass it if you used `requestKey` in query action, refer to `getQuery` from the core library
- `multiple: boolean`: refer to `getQuery` from the core library
- `defaultData`: refer to `getQuery` from the core library
- `selector`: if you already have a query selector, pass it here instead of `type`
- `children` - render function receiving object with data, loading flag and error property
- `component` - alternative prop to children, you can pass your custom component here, which will receive data, loading and error props, plus any additional props passed to `Query`
- `isDataEmpty: query => boolean`: function which defines when `data` is empty, by default data as empty array and falsy value like `null`, `undefined` is considered as empty
  when data is updated - it will still show during initial fetch, but ill not for subsequent requests
- `noDataMessage`: `string` or any React node, like `<div>message</div>`, which will be rendered when `data` is empty
- `errorComponent`: custom React component, which will be rendered on error, receives `error` prop, `null` by default
- `errorComponentProps`: extra props which will be passed to `errorComponent`
- `loadingComponent` custom React component, which will be rndered when request is pending, useful for showing spinners,
  receives `downloadProgress` and `uploadProgress` props, useful when `requestAction.meta.measureDownloadProgress` or
  `requestAction.meta.measureUploadProgress` is `true`
- `loadingComponentProps`: extra props which will be passed to `loadingComponent`
  spinners, `null` by default
- `showLoaderDuringRefetch: boolean`: `true` by default, whether `loadingComponent` will be shown on data refetch
  or not, if `false` you won't see spinner even when data is being loaded if you already have some data from a previous requests
- `action`: useful only when you use Typescript, see details [here](/docs/guides/usage-with-typescript#automatic-data-inference)

Minimalistic example:

```js
import { Query } from '@redux-requests/react';

<Query
  type={REQUEST_TYPE}
  // or selector={myQuerySelector}
>
  {({ data }) => <div>{data}</div>}
</Query>;
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
/>;
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
    Array.isArray(query.data) ? query.data.length === 0 : !query.data
  }
  showLoaderDuringRefetch={false}
  noDataMessage="There is no data"
  errorComponent={ErrorComponent}
  errorComponentProps={{ label: 'Error label' }}
  loadingComponent={LoadingComponent}
  loadingComponentProps={{ label: 'Loading label' }}
>
  {({ data }) => <div>{data}</div>}
</Query>;
```

### `Mutation`

`Mutation` is render prop alternative to `useMutation` hook. However, for now this component is not in par with `useMutation`.
It can be only used to read mutation state, not to automatically reset mutations and so on. For that, use either `useMutation`
or create your own render prop component basing on `useMutation`. Time will tell whether `Mutation` will be deprecated or
will match all `useMutation` functionality.

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
        Send mutation {loading && '...'}
      </button>
    );
  }}
</Mutation>;
```
