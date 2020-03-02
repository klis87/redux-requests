import React from 'react';
import { resetRequests } from 'redux-saga-requests';
import { Query } from 'redux-saga-requests-react';
import { useDispatch } from 'react-redux';

import {
  FETCH_BOOKS,
  FETCH_BOOK,
  FETCH_BOOKS_SCREENING_ACTORS,
} from '../store/constants';
import { fetchBook, fetchBooks } from '../store/actions';
import Spinner from './spinner';

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Saga Requests Server side rendering example</h1>
      <hr />

      <div>
        <h2>Book</h2>
        <button type="button" onClick={() => dispatch(fetchBook(1))}>
          fetch book 1
        </button>
        <button type="button" onClick={() => dispatch(fetchBook(2))}>
          fetch book 2
        </button>
        <button type="button" onClick={() => dispatch(fetchBook(3))}>
          fetch book 3
        </button>
        <button type="button" onClick={() => dispatch(fetchBook(4))}>
          fetch book 4
        </button>
        {['1', '2', '3', '4'].map(i => (
          <Query
            key={i}
            type={FETCH_BOOK}
            requestKey={i}
            errorComponent={RequestError}
            loadingComponent={Spinner}
            noDataMessage={<p>{i} There is no entity currently.</p>}
          >
            {({ data }) => (
              <div>
                <h3>{data.title}</h3>
                <div>{data.author}</div>
                <hr />
              </div>
            )}
          </Query>
        ))}
        <hr />
        <h2>Books</h2>
        <button
          type="button"
          onClick={() => dispatch(resetRequests([FETCH_BOOKS]))}
        >
          reset books
        </button>
        <button type="button" onClick={() => dispatch(fetchBooks())}>
          fetch books
        </button>
        <Query
          type={FETCH_BOOKS}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) =>
            data.map(book => {
              return (
                <div key={book.id}>
                  <h3>{book.title}</h3>
                  <div>{book.author}</div>
                </div>
              );
            })
          }
        </Query>
        <hr />
        <h2>Books screening actors</h2>
        <Query
          type={FETCH_BOOKS_SCREENING_ACTORS}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) =>
            data.map(author => {
              return (
                <div key={author.id}>
                  <h3>{author.name}</h3>
                  <div>{author.bookTitle}</div>
                </div>
              );
            })
          }
        </Query>
      </div>
    </div>
  );
};

export default App;
