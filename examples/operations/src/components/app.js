import React from 'react';
import { connect } from 'react-redux';
import {
  ConnectedRequestContainer,
  ConnectedOperationContainer,
} from 'redux-saga-requests-react';

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
  deletePhotoOptimistic,
  fetchPosts,
  deletePostOptimistic,
};

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = ({
  fetchPhoto,
  deletePhotoOptimistic,
  fetchPosts,
  deletePostOptimistic,
}) => (
  <div>
    <h1>Redux Saga Requests operations example</h1>
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
      <ConnectedRequestContainer
        requestSelector={state => state.photo}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data, operations }) => (
          <div>
            <h3>{data.title}</h3>
            <img src={data.thumbnailUrl} alt={data.title} />
            <hr />
            <ConnectedOperationContainer
              operation={operations[DELETE_PHOTO]}
              operationCreator={deletePhoto}
            >
              {({ loading, sendOperation }) => (
                <button
                  type="button"
                  onClick={() => sendOperation(data.id)}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </ConnectedOperationContainer>
            <button type="button" onClick={() => deletePhotoOptimistic(data)}>
              Delete optimistic
            </button>
          </div>
        )}
      </ConnectedRequestContainer>
    </div>
    <hr />
    <div>
      <h2>Posts</h2>
      <button type="button" style={buttonStyle} onClick={fetchPosts}>
        Fetch posts
      </button>
      <ConnectedRequestContainer
        requestSelector={state => state.posts}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data, operations }) =>
          data.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <ConnectedOperationContainer
                operation={operations[DELETE_POST]}
                operationCreator={deletePost}
                requestKey={String(post.id)}
              >
                {({ loading, sendOperation }) => (
                  <button
                    type="button"
                    onClick={() => sendOperation(post.id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </ConnectedOperationContainer>
              <button type="button" onClick={() => deletePostOptimistic(post)}>
                Delete optimistic
              </button>
              <hr />
            </div>
          ))
        }
      </ConnectedRequestContainer>
    </div>
    <hr />
  </div>
);

export default connect(
  null,
  mapDispatchToProps,
)(App);
