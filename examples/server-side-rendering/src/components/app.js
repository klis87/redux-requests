import React from 'react';
import { ConnectedRequestContainer } from 'redux-saga-requests-react';

import Spinner from './spinner';

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => (
  <div>
    <h1>Redux Saga Requests Server side rendering example</h1>
    <hr />
    <div>
      <h2>Books</h2>
      <ConnectedRequestContainer
        requestSelector={state => state.books}
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
      </ConnectedRequestContainer>
      <hr />
      <h2>Books screening actors</h2>
      <ConnectedRequestContainer
        requestSelector={state => state.booksScreeningActors}
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
      </ConnectedRequestContainer>
    </div>
  </div>
);

export default App;
