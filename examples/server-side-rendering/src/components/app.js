import React from 'react';
import { Query } from 'redux-saga-requests-react';
import { useDispatch } from 'react-redux';

import { FETCH_BOOKS, FETCH_BOOKS_SCREENING_ACTORS } from '../store/constants';
import { resetBooks, fetchBooks } from '../store/actions';
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
        <h2>Books</h2>
        <button type="button" onClick={() => dispatch(resetBooks())}>
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
