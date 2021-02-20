import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWebsocketState } from '@redux-requests/core';
import {
  Query,
  Mutation,
  useQuery,
  useSubscription,
} from '@redux-requests/react';

import {
  fetchNumberOfBookLikes,
  fetchBooks,
  fetchBook,
  deleteBook,
  likeBook,
  unlikeBook,
  uploadFile,
  uploadFiles,
  onBookLiked,
} from '../store/actions';
import {
  FETCH_NUMBER_OF_BOOK_LIKES,
  LIKE_BOOK,
  UNLIKE_BOOK,
  FETCH_BOOK,
  FETCH_BOOKS,
  UPLOAD_FILE,
  UPLOAD_FILES,
  ON_BOOK_LIKED,
} from '../store/constants';

import Spinner from './spinner';

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => {
  const dispatch = useDispatch();
  const websocketState = useSelector(getWebsocketState);
  const { data } = useQuery({
    type: FETCH_NUMBER_OF_BOOK_LIKES,
    action: fetchNumberOfBookLikes,
    autoLoad: true,
  });

  useSubscription({
    type: ON_BOOK_LIKED,
    action: onBookLiked,
  });

  return (
    <div>
      <h1>Redux Requests GraphQL example</h1>
      <div>
        WS: {websocketState.connected ? 'connected' : 'disconnected'},{' '}
        {websocketState.pristine ? 'pristine' : 'not pristine'}{' '}
      </div>
      {data && <div>Number of likes: {data.numberOfBookLikes}</div>}
      <p>
        In order to see aborts in action, you should set network throttling in
        your browser
      </p>
      <hr />
      <div>
        <h2>Books</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchBooks())}
        >
          Fetch books
        </button>
        <Query
          type={FETCH_BOOKS}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) =>
            data.books.map(book => {
              return (
                <div key={book.id}>
                  <h1>{book.title}</h1>
                  <div>{book.author}</div>
                  <button
                    type="button"
                    onClick={() => dispatch(deleteBook(book))}
                  >
                    Delete optimistic
                  </button>
                  <Mutation
                    type={book.liked ? UNLIKE_BOOK : LIKE_BOOK}
                    requestKey={book.id}
                  >
                    {({ loading }) => (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            book.liked
                              ? unlikeBook(book.id)
                              : likeBook(book.id),
                          )
                        }
                        disabled={loading}
                      >
                        {book.liked ? 'Unlike' : 'Like'}
                        {loading && '...'}
                      </button>
                    )}
                  </Mutation>
                </div>
              );
            })
          }
        </Query>
      </div>
      <hr />
      <div>
        <h2>Book</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchBook('1'))}
        >
          Fetch book with id 1
        </button>
        <Query
          type={FETCH_BOOK}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) => (
            <div>
              <h1>{data.book.title}</h1>
              <div>{data.book.author}</div>
            </div>
          )}
        </Query>
      </div>
      <hr />
      <div>
        <h2>Upload single file</h2>
        <input
          type="file"
          required
          onChange={({
            target: {
              validity,
              files: [file],
            },
          }) => validity.valid && dispatch(uploadFile(file))}
        />
        <Query
          type={UPLOAD_FILE}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) => (
            <div>
              <h1>{data.singleUpload.filename}</h1>
              <div>Mimetype: {data.singleUpload.mimetype}</div>
            </div>
          )}
        </Query>
      </div>
      <hr />
      <div>
        <h2>Upload multiple files</h2>
        <input
          type="file"
          required
          multiple
          onChange={({ target: { validity, files } }) =>
            validity.valid && dispatch(uploadFiles(files))
          }
        />
        <Query
          type={UPLOAD_FILES}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) =>
            data.multipleUpload.map((file, i) => (
              <div key={i}>
                <h1>{file.filename}</h1>
                <div>Mimetype: {file.mimetype}</div>
              </div>
            ))
          }
        </Query>
      </div>
    </div>
  );
};

export default App;
