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
    deletedBook: book,
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
    id,
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
    id,
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
});
