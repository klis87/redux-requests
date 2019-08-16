import React from 'react';
import { useDispatch } from 'react-redux';
import { Query } from 'redux-saga-requests-react';

import { fetchPhoto, clearPhoto, fetchPost, clearPost } from '../store/actions';
import { FETCH_PHOTO, FETCH_POST } from '../store/constants';
import Spinner from './spinner';
import Photo from './photo';
import Post from './post';

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Saga Requests basic example</h1>
      <p>
        In order to see aborts in action, you should set network throttling in
        your browser
      </p>
      <hr />
      <div>
        <h2>Photo</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(clearPhoto())}
        >
          Clear
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
          Fetch non-existent photo
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
          onClick={() => dispatch(clearPost())}
        >
          Clear
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
