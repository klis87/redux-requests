---
title: ResponseData
description: ResponseData API reference for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

Sometimes you might want to use a type which is just a `Data` generic used in a request action. For your convenience, instead
of checking and worrying about it, you can just get it from a request action with `ResponseData`, for example:

```ts
import { ResponseData } from '@redux-requests/core';

type BookData = ResponseData<typeof fetchBook>;
// the same as type BookData = { id: string; name: string }
```
