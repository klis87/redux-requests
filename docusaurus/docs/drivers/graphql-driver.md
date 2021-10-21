---
title: GraphQL driver
description: GraphQL guide for redux-requests - declarative AJAX requests and automatic network state management for single-page applications
---

## Introduction

Choose this driver, if you need to communicate with **GraphQL** server. Of course, it
is possible to do it directly with `axios` or `fetch` driver, but **GraphQL** communication
will be much simpler with this one. Not to mention that it has some functionalities
compatible with Apollo server and tooling, like `gql` tag and `GraphQL multipart request specification`
to facilitate files uploads.

## Installation

To install the package, just run:

```bash
$ npm install @redux-requests/graphql
```

or you can just use CDN: `https://unpkg.com/@redux-requests/graphql`.

## Usage

Let's assume we have the following GraphQL schema:

```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  liked: Boolean!
}

type File {
  filename: String!
  mimetype: String!
  encoding: String!
}

type Query {
  books: [Book!]!
  book(id: ID!): Book
}

type Mutation {
  deleteBook(id: ID!): Book
  singleUpload(file: Upload!): File!
  multipleUpload(files: [Upload!]!): [File!]!
}

type Subscription {
  onBookLiking(id: ID!): Book
}
```

To use this driver, just import it and pass to `handleRequests`, like you would do
with other drivers:

```js
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/graphql';

handleRequests({
  driver: createDriver({ url: 'http://localhost:3000/graphql' }),
});
```

To enable cross-site Access-Control requests to be made using credentials, `handleRequests` is configured as follows:

```js
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/graphql';

handleRequests({
  driver: createDriver({
    url: 'http://localhost:3000/graphql',
    withCredentials: true
  }),
});
```

In order to send a query, just do it in a similar fashion to other drivers. The only
one thing really specific to GraphQL is a way you define your actions. Let's create an action
to fetch books:

```js
import { gql } from '@redux-requests/graphql';

const fetchBooks = () => ({
  type: 'FETCH_BOOKS',
  request: {
    query: gql`
      {
        books {
          id
          title
          author
          liked
        }
      }
    `,
    headers: {
      SOMEHEADER: 'SOMEHEADER',
    },
  },
});
```

As you see, there is nothing fancy here, you just write GraphQL. Notice we wrap it in
`gql` tag. Currently it only trims queries, but in the future it could do other stuff,
so it is recommended to wrap all your queries in `gql`, especially that it will hint
most of code editors to properly highlight them. Also notice that it is possible to
pass `headers`, which could be useful for authentication for instance.

## Passing variables

Now, let's fetch a specific book, which requires using variables:

```js
const fetchBook = id => ({
  type: 'FETCH_BOOK',
  request: {
    query: gql`
      query($id: ID!) {
        book(id: $id) {
          id
          title
          author
          liked
        }
      }
    `,
    variables: { id },
  },
});
```

## Using GraphQL fragments

Notice `Book` properties repeated across those two queries. As you probably know,
the answer for this problem is GraphQL fragment, which you can create like this:

```js
const bookFragment = gql`
  fragment BookFragment on Book {
    id
    title
    author
    liked
  }
`;

const fetchBook = id => ({
  type: 'FETCH_BOOK',
  request: {
    query: gql`
      query($id: ID!) {
        book(id: $id) {
          ...BookFragment
        }
      }
      ${bookFragment}
    `,
    variables: { id },
  },
});
```

## Mutations

Mutations are done like queries, just use GraphQL language:

```js
const deleteBook = id => ({
  type: 'DELETE_BOOK',
  request: {
    query: gql`
      mutation($id: ID!) {
        deleteBook(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  },
});
```

## Subscriptions

Again, just use subscription action structure and GraphQL language:

```js
const onBookLiking = id => ({
  type: 'ON_BOOK_LIKING',
  subscription: {
    query: gql`
      subscription($id: ID!) {
        onBookLiking(id: $id) {
          id
          liked
        }
      }
    `,
    variables: { id },
  },
});
```

In order for this to work, it is needed to configure `subscriber` to be compatible with [Apollo Websocket Protocol](https://github.com/apollographql/subscriptions-transport-ws/blob/master/PROTOCOL.md). Here is how:

```js
import { handleRequests } from '@redux-requests/core';
import { createDriver, createSubscriber } from '@redux-requests/graphql';

handleRequests({
  driver: createDriver({ url: 'http://localhost:3000/graphql' }),
  subscriber: createSubscriber({
    url: 'ws://localhost:3000/graphql',
    lazy: true, // false by default
    useHeartbeat: true, // pass true if you use apollo server heartbeats
    heartbeatTimeout: 20, // 20 by default
    reconnectTimeout: 5, // 5 by default
    // WS: CustomWebsocketConstructor
  }),
});
```

## File uploads

Upload files according to [GraphQL multipart request specification](https://github.com/jaydenseric/graphql-multipart-request-spec), which is also used by other
GraphQL clients and servers, like Apollo, is also supported.

So, to upload a single file:

```js
const uploadFile = file => ({
  type: 'UPLOAD_FILE',
  request: {
    query: gql`
      mutation($file: Upload!) {
        singleUpload(file: $file) {
          filename
          mimetype
          encoding
        }
      }
    `,
    variables: { file },
  },
});
```

... or, to upload multiple files:

```js
const uploadFiles = files => ({
  type: 'UPLOAD_FILES',
  request: {
    query: gql`
      mutation($files: [Upload!]!) {
        multipleUpload(files: $files) {
          filename
          mimetype
          encoding
        }
      }
    `,
    variables: { files },
  },
});
```

So, you can do it exactly in the same way like other libraries supporting
`GraphQL multipart request specification`.

## Progress event support

`graphql` driver supports [ProgressEvent](https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent). All you
need to do is to add `meta.measureDownloadProgress` or `meta.measureUploadProgress` to a request action and
you could access `downloadProgress` or `uploadProgress` values from selectors like `getQuery` or `getMutation`.
