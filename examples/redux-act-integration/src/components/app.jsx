import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetRequests, abortRequests } from '@redux-requests/core';
import { Query, Mutation } from '@redux-requests/react';

import {
  fetchPhoto,
  deletePhoto,
  fetchPosts,
  deletePost,
} from '../store/actions';

import Spinner from './spinner';

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => {
  const abortCounter = useSelector(state => state.abortCounter);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Requests integration with Redux Act example</h1>
      <p>
        In order to see aborts in action, you should set network throttling in
        your browser
      </p>
      <hr />
      <div>
        <span>Abort counter: {abortCounter}</span>
      </div>
      <hr />
      <div>
        <h2>Photo</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(abortRequests([fetchPhoto]))}
        >
          Abort
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(resetRequests([fetchPhoto]))}
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
          Fetch non-existent photo
        </button>
        <Query
          type={fetchPhoto}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) => (
            <div>
              <h3>{data.title}</h3>
              <img src={data.thumbnailUrl} alt={data.title} />
              <hr />
              <Mutation type={deletePhoto}>
                {({ loading }) => (
                  <button
                    type="button"
                    onClick={() => dispatch(deletePhoto(data.id))}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </Mutation>
            </div>
          )}
        </Query>
      </div>
      <hr />
      <div>
        <h2>Post</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(abortRequests([fetchPosts]))}
        >
          Abort
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(resetRequests([fetchPosts]))}
        >
          Reset
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchPosts())}
        >
          Fetch posts
        </button>
        <Query
          type={fetchPosts}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) =>
            data.map(post => (
              <div key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <Mutation type={deletePost} requestKey={String(post.id)}>
                  {({ loading }) => (
                    <button
                      type="button"
                      onClick={() => dispatch(deletePost(post.id))}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </Mutation>
                <hr />
              </div>
            ))
          }
        </Query>
      </div>
      <hr />
    </div>
  );
};

export default App;
