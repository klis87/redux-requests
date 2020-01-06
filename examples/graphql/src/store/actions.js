import { gql } from 'redux-saga-requests-graphql';

import {
  FETCH_BOOKS,
  FETCH_BOOK,
  DELETE_BOOK,
  LIKE_BOOK,
  UNLIKE_BOOK,
  UPLOAD_FILE,
  UPLOAD_FILES,
} from './constants';

const bookFragment = gql`
  fragment BookFragment on Book {
    id
    title
    author
  }
`;

export const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    query: gql`
      {
        books {
          ...BookFragment
          liked
        }
      }
      ${bookFragment}
    `,
  },
});

export const fetchBook = id => ({
  type: FETCH_BOOK,
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

export const deleteBook = book => ({
  type: DELETE_BOOK,
  request: {
    query: gql`
      mutation($id: ID!) {
        deleteBook(id: $id) {
          id
        }
      }
    `,
    variables: { id: book.id },
  },
  meta: {
    requestKey: book.id,
    mutations: {
      [FETCH_BOOKS]: {
        updateDataOptimistic: data => ({
          books: data.books.filter(v => v.id !== book.id),
        }),
        revertData: data => ({
          books: [book, ...data.books],
        }),
      },
    },
  },
});

export const likeBook = id => ({
  type: LIKE_BOOK,
  request: {
    query: gql`
      mutation($id: ID!) {
        likeBook(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_BOOKS]: {
        updateData: data => ({
          books: data.books.map(v => (v.id === id ? { ...v, liked: true } : v)),
        }),
      },
    },
  },
});

export const unlikeBook = id => ({
  type: UNLIKE_BOOK,
  request: {
    query: gql`
      mutation($id: ID!) {
        unlikeBook(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_BOOKS]: {
        updateData: data => ({
          books: data.books.map(v =>
            v.id === id ? { ...v, liked: false } : v,
          ),
        }),
      },
    },
  },
});

const fileFragment = gql`
  fragment FileFragment on File {
    filename
    mimetype
  }
`;

export const uploadFile = file => ({
  type: UPLOAD_FILE,
  request: {
    query: gql`
      mutation($file: Upload!) {
        singleUpload(file: $file) {
          ...FileFragment
        }
      }
      ${fileFragment}
    `,
    variables: { file },
  },
  meta: {
    asMutation: false,
  },
});

export const uploadFiles = files => ({
  type: UPLOAD_FILES,
  request: {
    query: gql`
      mutation($files: [Upload!]!) {
        multipleUpload(files: $files) {
          ...FileFragment
        }
      }
      ${fileFragment}
    `,
    variables: { files },
  },
  meta: {
    asMutation: false,
  },
});
