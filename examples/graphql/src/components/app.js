import React from 'react';
import { connect } from 'react-redux';
import {
  ConnectedRequestContainer,
  ConnectedOperationContainer,
} from 'redux-saga-requests-react';

import {
  fetchBooks,
  fetchBook,
  deleteBook,
  likeBook,
  unlikeBook,
  uploadFile,
  uploadFiles,
} from '../store/actions';
import {
  LIKE_BOOK,
  UNLIKE_BOOK,
  FETCH_BOOK,
  FETCH_BOOKS,
  UPLOAD_FILE,
  UPLOAD_FILES,
} from '../store/constants';
import Spinner from './spinner';

const mapDispatchToProps = {
  fetchBooks,
  fetchBook,
  deleteBook,
  uploadFile,
  uploadFiles,
};

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = ({
  fetchBooks,
  deleteBook,
  fetchBook,
  uploadFile,
  uploadFiles,
}) => (
  <div>
    <h1>Redux Saga Requests GraphQL example</h1>
    <p>
      In order to see aborts in action, you should set network throttling in
      your browser
    </p>
    <hr />
    <div>
      <h2>Books</h2>
      <button type="button" style={buttonStyle} onClick={() => fetchBooks()}>
        Fetch books
      </button>
      <ConnectedRequestContainer
        queryType={FETCH_BOOKS}
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
                <button type="button" onClick={() => deleteBook(book)}>
                  Delete optimistic
                </button>
                <ConnectedOperationContainer
                  operationType={book.liked ? UNLIKE_BOOK : LIKE_BOOK}
                  requestKey={book.id}
                  operationCreator={book.liked ? unlikeBook : likeBook}
                >
                  {({ loading, sendOperation }) => (
                    <button
                      type="button"
                      onClick={() => sendOperation(book.id)}
                      disabled={loading}
                    >
                      {book.liked ? 'Unlike' : 'Like'}
                      {loading && '...'}
                    </button>
                  )}
                </ConnectedOperationContainer>
              </div>
            );
          })
        }
      </ConnectedRequestContainer>
    </div>
    <hr />
    <div>
      <h2>Book</h2>
      <button type="button" style={buttonStyle} onClick={() => fetchBook('1')}>
        Fetch book with id 1
      </button>
      <ConnectedRequestContainer
        queryType={FETCH_BOOK}
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
      </ConnectedRequestContainer>
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
        }) => validity.valid && uploadFile(file)}
      />
      <ConnectedRequestContainer
        queryType={UPLOAD_FILE}
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
      </ConnectedRequestContainer>
    </div>
    <hr />
    <div>
      <h2>Upload multiple files</h2>
      <input
        type="file"
        required
        multiple
        onChange={({ target: { validity, files } }) =>
          validity.valid && uploadFiles(files)
        }
      />
      <ConnectedRequestContainer
        queryType={UPLOAD_FILES}
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
      </ConnectedRequestContainer>
    </div>
  </div>
);

export default connect(
  null,
  mapDispatchToProps,
)(App);
