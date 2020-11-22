import React from 'react';
import { useDispatch } from 'react-redux';
import { Query, Mutation } from '@redux-requests/react';

import {
  fetchPhoto,
  deletePhoto,
  deletePhotoOptimistic,
  fetchPosts,
  deletePost,
  deletePostOptimistic,
} from '../store/actions';
import {
  DELETE_PHOTO,
  DELETE_POST,
  FETCH_PHOTO,
  FETCH_POSTS,
} from '../store/constants';

import Spinner from './spinner';

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Requests mutations example</h1>
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
          onClick={() => dispatch(fetchPhoto(1))}
        >
          Fetch photo with id 1
        </button>
        <Query
          type={FETCH_PHOTO}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) => (
            <div>
              <h3>{data.title}</h3>
              <img src={data.thumbnailUrl} alt={data.title} />
              <hr />
              <Mutation type={DELETE_PHOTO}>
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
              <button
                type="button"
                onClick={() => dispatch(deletePhotoOptimistic(data))}
              >
                Delete optimistic
              </button>
            </div>
          )}
        </Query>
      </div>
      <hr />
      <div>
        <h2>Posts</h2>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => dispatch(fetchPosts())}
        >
          Fetch posts
        </button>
        <Query
          type={FETCH_POSTS}
          errorComponent={RequestError}
          loadingComponent={Spinner}
          noDataMessage={<p>There is no entity currently.</p>}
        >
          {({ data }) =>
            data.map(post => (
              <div key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <Mutation type={DELETE_POST} requestKey={String(post.id)}>
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
                <button
                  type="button"
                  onClick={() => dispatch(deletePostOptimistic(post))}
                >
                  Delete optimistic
                </button>
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
