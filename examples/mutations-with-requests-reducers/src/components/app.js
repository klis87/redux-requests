import React from 'react';
import { connect } from 'react-redux';
import { ConnectedQuery, ConnectedMutation } from 'redux-saga-requests-react';

import {
  fetchPhoto,
  deletePhoto,
  deletePhotoOptimistic,
  fetchPosts,
  deletePost,
  deletePostOptimistic,
} from '../store/actions';
import { DELETE_PHOTO, DELETE_POST } from '../store/constants';
import Spinner from './spinner';

const mapDispatchToProps = {
  fetchPhoto,
  deletePhoto,
  deletePhotoOptimistic,
  fetchPosts,
  deletePost,
  deletePostOptimistic,
};

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = ({
  fetchPhoto,
  deletePhoto,
  deletePhotoOptimistic,
  fetchPosts,
  deletePost,
  deletePostOptimistic,
}) => (
  <div>
    <h1>Redux Saga Requests mutations with requests reducers example</h1>
    <p>
      In order to see aborts in action, you should set network throttling in
      your browser
    </p>
    <hr />
    <div>
      <h2>Photo</h2>
      <button type="button" style={buttonStyle} onClick={() => fetchPhoto(1)}>
        Fetch photo with id 1
      </button>
      <ConnectedQuery
        requestSelector={state => state.photo}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data }) => (
          <div>
            <h3>{data.title}</h3>
            <img src={data.thumbnailUrl} alt={data.title} />
            <hr />
            <ConnectedMutation
              requestSelector={state => state.photo}
              type={DELETE_PHOTO}
            >
              {({ loading }) => (
                <button
                  type="button"
                  onClick={() => deletePhoto(data.id)}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </ConnectedMutation>
            <button type="button" onClick={() => deletePhotoOptimistic(data)}>
              Delete optimistic
            </button>
          </div>
        )}
      </ConnectedQuery>
    </div>
    <hr />
    <div>
      <h2>Posts</h2>
      <button type="button" style={buttonStyle} onClick={fetchPosts}>
        Fetch posts
      </button>
      <ConnectedQuery
        requestSelector={state => state.posts}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data }) =>
          data.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <ConnectedMutation
                type={DELETE_POST}
                requestSelector={state => state.posts}
                requestKey={String(post.id)}
              >
                {({ loading }) => (
                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </ConnectedMutation>
              <button type="button" onClick={() => deletePostOptimistic(post)}>
                Delete optimistic
              </button>
              <hr />
            </div>
          ))
        }
      </ConnectedQuery>
    </div>
    <hr />
  </div>
);

export default connect(
  null,
  mapDispatchToProps,
)(App);
