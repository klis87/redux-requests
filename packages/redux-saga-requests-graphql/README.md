# @redux-requests/graphql

[![npm version](https://badge.fury.io/js/redux-saga-requests-graphql.svg)](https://badge.fury.io/js/redux-saga-requests-graphql)
[![Build Status](https://travis-ci.org/klis87/redux-saga-requests.svg?branch=master)](https://travis-ci.org/klis87/redux-saga-requests)
[![Coverage Status](https://coveralls.io/repos/github/klis87/redux-saga-requests/badge.svg?branch=master)](https://coveralls.io/github/klis87/redux-saga-requests?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/klis87/redux-saga-requests/badge.svg)](https://snyk.io/test/github/klis87/redux-saga-requests)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

GraphQL driver to Redux - addon to simplify handling of AJAX requests.

## Installation

To install the package, just run:
```
$ npm install @redux-requests/graphql
```
or you can just use CDN: `https://unpkg.com/redux-saga-requests-graphql`.

For general usage, see [redux-saga-requests docs](https://github.com/klis87/redux-requests).

Regarding GraphQL, let's assume we have the following GraphQL schema:
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
most of code editors to properly highlight them.

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

Be aware, that all queries are executed as `takeLatest`, and mutations as `takeEvery`,
see [redux-requests docs](https://github.com/klis87/redux-requests) for more details
and how to adjust it if you need it.

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

The rest works exactly the same like when using other drivers, see
[GraphQL example](https://github.com/klis87/redux-requests/tree/master/examples/graphql)
for more info if you need it.

TODO:
- handling GraphQL subscription
- possibly adding data normalization like Apollo
- adding client side directives

## Licence

MIT
