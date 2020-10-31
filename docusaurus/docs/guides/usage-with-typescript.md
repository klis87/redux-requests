---
title: Usage with Typescript
description: Typescript guide for redux-requests - declarative AJAX requests and automatic network state management for Redux
---

## How to use it with Typescript?

Because `redux-requests` has Typescript types for its whole API included, you don't need to do anything to use it with Typescript. However,
there are some special goodies added to make Typescript users even more happy, so it is really worth knowing about them!

## `RequestAction` interface

As you probably already know, the heart of `redux-requests` are so-called **requests actions**. If you use Typescript, probably you would
like to have them typed! There are 2 ways of doing this:

```ts
import { RequestAction } from '@redux-requests/core';

function fetchBooks(): RequestAction {
  return {
    type: 'FETCH_BOOKS',
    request: {
      url: '/books',
    },
  };
}
```

or...

```ts
import { RequestAction } from '@redux-requests/core';

const fetchBooks: () => RequestAction = () => ({
  type: 'FETCH_BOOKS',
  request: {
    url: '/books',
  },
});
```

The choice is yours, both are equivalent. Both ways will give you type checking and autocomplete for request action structure, like all
`meta` attributes, for example `getData` and so on. The true power though could be achieved with generics!

## `Data` and `TransformedData` generics

Before we go on, it is recommended to get familiar with [Typescript generics](https://www.typescriptlang.org/docs/handbook/generics.html)
first if you didn't encounter them before. Going back to `Data` and `TransformedData` generics, they allow you to describe a structure
of data responded by your server for a given request. Let's see an example:

```ts
function fetchBook(id: string): RequestAction<{ id: string; title: string }> {
  return {
    type: 'FETCH_BOOK',
    request: {
      url: `/books/${id}`,
    },
  };
}
```

By doing so, we just marked that `fetchBook` request will respond with an object like `{ id: '1', title: 'A book' }`. You might be
wondering, what are the benefits? We will get there, but let's start with a simple one:

```ts
function fetchBook(
  id: string,
): RequestAction<{ id: string; title: string }, { id: string; name: string }> {
  return {
    type: 'FETCH_BOOK',
    request: {
      url: `/books/${id}`,
    },
    meta: {
      getData: data => ({ id: data.id, name: data.title }),
    },
  };
}
```

As you can see, we passed a 2nd generic called `TransformedData` and implemented `meta.getData` to replace `title` attribute
with `name`. As you probably know, `getData` allows to change a server response data to fit your need. Adding `Data` and `TransformedData`
generics here made `getData` automatically typed - that's it - Typescript will recognize that `data` has `{ id: string, title: string }`
type and `getData` response has `{ id: string, name: string }` type. This gives you very good confidence, that `getData` transformation
is done correctly, for instance `data => ({ id: data.id, name2: data.title })` would immediately show error because `TransformedData`
doesn't have `name2` attribute.

Interestingly, `TransformedData` defaults to `Data`, so passing `RequestAction<{ title: string }>` is the same as passing
`RequestAction<{ title: string }, { title: string }>`.

Ok, but if we don't use `getData`, why would we even care about those generics? It turns out that it is very useful to
define `Data` generic in all cases, because then you will enjoy an automatic type inference for the whole application!
Before we will learn about it, first let's learn how to use Typescript with selectors!

## `getQuery` and `getQuerySelector` generics

If you need to read a state from Redux store, you usually do this with selectors. As you probably know, `redux-requests` has
several optimized selectors built-in. Let's use them to read book data:

```ts
import { getQuery } from '@redux-requests/core';

const { data, loading, error } = getQuery(state, { type: 'FETCH_BOOK' });
```

Ok, but it would be cool to have `data` typed, wouldn't it? Let's fix that by a generic:

```ts
const { data, loading, error } = getQuery<{ id: string; title: string }>(
  state,
  { type: 'FETCH_BOOK' },
);
```

That's better, now `data` is typed properly! Let's see how it would be done with `getQuerySelector`:

```ts
import { getQuerySelector } from '@redux-requests/core';

const bookSelector = getQuerySelector<{ id: string; title: string }>({
  type: 'FETCH_BOOK',
});
const { data, loading, error } = bookSelector(state);
```

Now, imagine you need an access to a given request data type in multiple places. Wouldn't it be better to pass a generic once
and forget about it? This is where **automatic data inference** comes into play and it answers the question why it is useful
to provide `Data` generic to request actions!

## Automatic data inference

So, how does it work in practice? Let's go back to `fetchBook` action. It has already defined `data` type. It turns out that
generics of selectors and actions are connected, so instead of passing a generic in selectors, you can just pass actions as `action` prop:

```ts
const { data, loading, error } = getQuery(state, {
  type: 'FETCH_BOOK',
  action: fetchBook,
});
```

or... with `getQuerySelector`:

```ts
const bookSelector = getQuerySelector({
  type: 'FETCH_BOOK',
  action: fetchBook,
});
const { data, loading, error } = bookSelector(state);
```

The downside is, that you need to provide both action and constant, which is not perfect. But, there is a way to fix that!
Just use an action creator library and forget about constants!

## Using with action creator library

Before showing how to use an action creator library with Typescript, see [general guide](/docs/guides/actions#action-creator-libraries)
if you didn't already! One you have done that, we will show below how combine [redux-smart-actions](https://github.com/klis87/redux-smart-actions)
with Typescript and how it could help us with `Data` generics:

```ts
import { createSmartAction } from 'redux-smart-actions';

const fetchBook = createSmartAction(function(
  id: string,
): RequestAction<{ id: string; title: string }, { id: string; name: string }> {
  return {
    request: {
      url: `/books/${id}`,
    },
    meta: {
      getData: data => ({ id: data.id, name: data.title }),
    },
  };
});
```

or with a slightly different syntax...

```ts
import { createSmartAction } from 'redux-smart-actions';

const fetchBook: (
  id: string,
) => RequestAction<
  { id: string; title: string },
  { id: string; name: string }
> = createSmartAction(id => {
  return {
    request: {
      url: `/books/${id}`,
    },
    meta: {
      getData: data => ({ id: data.id, name: data.title }),
    },
  };
});
```

Notice that we don't have `type` anymore! `fetchBook.toString() === 'FETCH_BOOK'`, so now you can pass it
in all `redux-requests` functions wherever you would pass `FETCH_BOOK` type! For example:

```ts
const { data, loading, error } = getQuery(state, {
  type: fetchBook,
});
```

That's it! We don't need `action` prop anymore as `type` already has it! We needed to define type for data only in `fetchBook`, you can pass it in selectors in mupltiple places and have `data` typed automatically!

What is interesting, you could even have this code in `js` file, still your editor like `vscode` would show you `data` structure, so
this means that you could use Typescript only in actions files but javascript in others and still have `data` autocompletion!

## `RequestsStore` and `dispatchRequest`

As always, in order to create a request, you must dispatch a **request action**, for instance:

```js
const { data, error } = await store.dispatch(fetchBook('1'));
```

There is a problem though, `dispatch` is not properly typed, because the official `Redux` types for `dispatch` cannot know about
middleware from this library, which returns a promise with server response for dispatched request actions.

Fortunately, in all places you would dispatch **request actions**, you could use `RequestsStore` and its `dispatchRequest` method:

```js
import { createRequestsStore } from '@redux-requests/core';

const requestsStore = createRequestsStore(store);
const { data, error } = await requestsStore.dispatchRequest(fetchBook('1'));
```

Now, result of `dispatchRequest` is properly typed, and as a bonus, if you defined `Data` generic in dispatched
action, also `data` will be typed! Again, automatic type inference!

Regarding functionality, `createRequestsStore` doesn't do anything else than normal store, it just decorates passed store
with `dispatchRequest` method which is just a copy of normal `dispatch`. So, `dispatchRequest` does exactly the same thing
as `dispatch`, the only difference is that `dispatchRequest` is properly typed.

What's interesting, in all interceptors you have access to `RequestsStore` instead of `Store`, so you already could utilize
`dispatchRequest` there.

## `ResponseData` utility type

Sometimes you might want to use a type which is just a `Data` generic used in a request action. For your convenience, instead
of checking and worrying about it, you can just get it from a request action, for example:

```ts
import { ResponseData } from '@redux-requests/core';

type BookData = ResponseData<typeof fetchBook>;
// the same as type BookData = { id: string; name: string }
```

## `LocalMutationAction`

If you use a local mutation, you could also use `LocalMutationAction` interface:

```ts
import { LocalMutationAction } from '@redux-requests/core';

function updateBookName(id: string, newName: string): LocalMutationAction {
  return {
    type: 'UPDATE_BOOK_NAME',
    meta: {
      mutations: {
        FETCH_BOOK: {
          updateData: data =>
            data && data.id === id ? { ...data, name: newName } : data,
          local: true,
        },
      },
    },
  };
}
```

...or if `fetchBook` is normalized, you could just:

```ts
import { LocalMutationAction } from '@redux-requests/core';

function updateBookName(id: string, newName: string): LocalMutationAction {
  return {
    type: 'UPDATE_BOOK_NAME',
    meta: {
      localData: { id, name: newName },
    },
  };
}
```

## Usage with React

If you use React, `useQuery` and `Query` also have `action` prop, and also you could pass a request action as `type` if
you use a library like `redux-smart-actions` - in the similar fashion as in `getQuery` and `getQuerySelector`.

Also, instead of `useDispatch` from `react-redux`, you can use `useDispatchRequest`:

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

Then you could enjoy `data` inference like in `dispatchRequest` from `RequestsStore`. From functionality perspective though,
`useDispatchRequest` is just reexported `useDispatch` from `react-redux`, so it works exactly the same.
