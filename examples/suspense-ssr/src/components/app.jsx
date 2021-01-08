import React, { Suspense, useMemo } from 'react';
import { useQuery } from '@redux-requests/react';

import { FETCH_BOOKS, FETCH_BOOKS_SCREENING_ACTORS } from '../store/constants';
import { fetchBooks, fetchBooksScreeningActors } from '../store/actions';

const Books = () => {
  const booksQuery = useQuery({
    type: FETCH_BOOKS,
    action: fetchBooks,
  });

  const booksIds = useMemo(
    () => (booksQuery.data ? booksQuery.data.map(v => v.id) : []),
    [booksQuery.data],
  );

  const actorsQuery = useQuery({
    type: FETCH_BOOKS_SCREENING_ACTORS,
    action: fetchBooksScreeningActors,
    variables: [booksIds],
    autoLoad: booksIds.length > 0,
  });

  return (
    <div>
      <h2>Books</h2>
      {!!booksQuery.data &&
        booksQuery.data.map(book => {
          return (
            <div key={book.id}>
              <h3>{book.title}</h3>
              <div>{book.author}</div>
            </div>
          );
        })}
      <h2>Actors</h2>
      {actorsQuery.error && 'actors error'}
      {!!actorsQuery.data &&
        actorsQuery.data.map(author => {
          return (
            <div key={author.id}>
              <h3>{author.name}</h3>
              <div>{author.bookTitle}</div>
            </div>
          );
        })}
    </div>
  );
};

const App = () => {
  return (
    <Suspense fallback="Loading">
      <div>
        <h1>Redux Requests Server suspense SSR example</h1>
        <Books />
      </div>
    </Suspense>
  );
};

export default App;
