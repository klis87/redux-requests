---
title: LocalMutationAction
description: LocalMutationAction API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

`LocalMutationAction` is a type which defines the structure of local mutation actions. You can use it if you use Typescript,
for example:

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
