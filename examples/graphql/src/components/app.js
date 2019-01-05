import React from 'react';
import { connect } from 'react-redux';

import {
  fetchBooks,
  fetchBook,
  deleteBook,
  likeBook,
  unlikeBook,
  uploadFile,
  uploadFiles,
} from '../store/actions';
import { LIKE_BOOK, UNLIKE_BOOK } from '../store/constants';
import EntityContainer from './entity-container';

// You should use selectors here in your real projects, here we don't for simplicity
const mapStateToProps = state => ({
  books: state.books,
  book: state.book,
  file: state.file,
  files: state.files,
});

const mapDispatchToProps = {
  fetchBooks,
  fetchBook,
  deleteBook,
  likeBook,
  unlikeBook,
  uploadFile,
  uploadFiles,
};

const buttonStyle = { marginRight: 10 };

const App = ({
  books,
  fetchBooks,
  book,
  fetchBook,
  deleteBook,
  likeBook,
  unlikeBook,
  file,
  uploadFile,
  files,
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
      <button style={buttonStyle} onClick={() => fetchBooks()}>
        Fetch books
      </button>
      <EntityContainer
        error={books.error}
        isFetching={books.pending > 0}
        isFetched={!!books.data}
      >
        {books.data &&
          books.data.books.map(book => {
            const operation =
              books.operations[book.liked ? UNLIKE_BOOK : LIKE_BOOK][book.id];
            const pending = operation && operation.pending > 0;

            return (
              <div key={book.id}>
                <h1>{book.title}</h1>
                <div>{book.author}</div>
                <button onClick={() => deleteBook(book)}>
                  Delete optimistic
                </button>
                <button
                  onClick={() =>
                    book.liked ? unlikeBook(book.id) : likeBook(book.id)
                  }
                  disabled={pending}
                >
                  {book.liked ? 'Unlike' : 'Like'}
                  {pending && '...'}
                </button>
              </div>
            );
          })}
      </EntityContainer>
    </div>

    <hr />
    <div>
      <h2>Book</h2>
      <button style={buttonStyle} onClick={() => fetchBook('1')}>
        Fetch book with id 1
      </button>
      <EntityContainer
        error={book.error}
        isFetching={book.pending > 0}
        isFetched={!!book.data}
      >
        {book.data && (
          <div>
            <h1>{book.data.book.title}</h1>
            <div>{book.data.book.author}</div>
          </div>
        )}
      </EntityContainer>
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
      <EntityContainer
        error={file.error}
        isFetching={file.pending > 0}
        isFetched={!!file.data}
      >
        {file.data && (
          <div>
            <h1>{file.data.singleUpload.filename}</h1>
            <div>Mimetype: {file.data.singleUpload.mimetype}</div>
          </div>
        )}
      </EntityContainer>
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
      <EntityContainer
        error={files.error}
        isFetching={files.pending > 0}
        isFetched={!!files.data}
      >
        {files.data &&
          files.data.multipleUpload.map((file, i) => (
            <div key={i}>
              <h1>{file.filename}</h1>
              <div>Mimetype: {file.mimetype}</div>
            </div>
          ))}
      </EntityContainer>
    </div>
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
