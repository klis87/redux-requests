import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetRequests, abortRequests } from 'redux-saga-requests';
import { Query } from 'redux-saga-requests-react';

import { fetchPhoto, fetchPost } from '../store/actions';
import { FETCH_PHOTO, FETCH_POST } from '../store/constants';
import Spinner from './spinner';
import Photo from './photo';
import Post from './post';

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => {
  const abortCounter = useSelector(state => state.abortCounter);
  const requestCounter = useSelector(state => state.requestCounter);
  const responseCounter = useSelector(state => state.responseCounter);
  const errorCounter = useSelector(state => state.errorCounter);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Saga Requests advanced example</h1>
      <p>
        In order to see aborts in action, you should set network throttling in
        your browser
      </p>
      <hr />
      <div>
        <div>Request counter: {requestCounter}</div>
        <div>Response counter: {responseCounter}</div>
        <div>Error counter: {errorCounter}</div>
        <div>Abort counter: {abortCounter}</div>
      </div>
      <hr />
      <div>
        <h2>Photo</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(abortRequests([FETCH_PHOTO]))}
        >
          Abort
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(resetRequests([FETCH_PHOTO]))}
        >
          Reset
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchPhoto(1))}
        >
          Fetch photo with id 1
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchPhoto(10001))}
        >
          Fetch non-existent photo, with id 1 as fallback (with onError
          interceptor)
        </button>
        <Query
          type={FETCH_PHOTO}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) => <Photo data={data} />}
        </Query>
      </div>
      <hr />
      <div>
        <h2>Post</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(abortRequests([FETCH_POST]))}
        >
          Abort
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(resetRequests([FETCH_POST]))}
        >
          Reset
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchPost(1))}
        >
          Fetch post with id 1
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchPost(1001))}
        >
          Fetch non-existent post
        </button>
        <Query
          type={FETCH_POST}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) => <Post data={data} />}
        </Query>
      </div>
      <hr />
    </div>
  );
};

export default App;
