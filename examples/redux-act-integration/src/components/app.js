import React from 'react';
import { connect } from 'react-redux';
import {
  ConnectedRequestContainer,
  ConnectedOperationContainer,
} from 'redux-saga-requests-react';

import {
  fetchPhotoAction,
  clearPhotoAction,
  deletePhotoAction,
  fetchPostsAction,
  clearPostsAction,
  deletePostAction,
} from '../store/actions';
import Spinner from './spinner';

// You should use selectors here in your real projects, here we don't for simplicity
const mapStateToProps = state => ({
  abortCounter: state.abortCounter,
});

const mapDispatchToProps = {
  fetchPhoto: fetchPhotoAction,
  clearPhoto: clearPhotoAction,
  fetchPosts: fetchPostsAction,
  clearPosts: clearPostsAction,
};

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = ({
  fetchPhoto,
  clearPhoto,
  fetchPosts,
  clearPosts,
  abortCounter,
}) => (
  <div>
    <h1>Redux Saga Requests integration with Redux Act example</h1>
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
      <button type="button" style={buttonStyle} onClick={() => clearPhoto()}>
        Clear
      </button>
      <button type="button" style={buttonStyle} onClick={() => fetchPhoto(1)}>
        Fetch photo with id 1
      </button>
      <button
        type="button"
        style={buttonStyle}
        onClick={() => fetchPhoto(10001)}
      >
        Fetch non-existent photo
      </button>
      <ConnectedRequestContainer
        queryType={fetchPhotoAction}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data }) => (
          <div>
            <h3>{data.title}</h3>
            <img src={data.thumbnailUrl} alt={data.title} />
            <hr />
            <ConnectedOperationContainer operationCreator={deletePhotoAction}>
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
          </div>
        )}
      </ConnectedRequestContainer>
    </div>
    <hr />
    <div>
      <h2>Post</h2>
      <button type="button" style={buttonStyle} onClick={() => clearPosts()}>
        Clear
      </button>
      <button type="button" style={buttonStyle} onClick={() => fetchPosts()}>
        Fetch posts
      </button>
      <ConnectedRequestContainer
        queryType={fetchPostsAction}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data }) =>
          data.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <ConnectedOperationContainer
                operationCreator={deletePostAction}
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
  mapStateToProps,
  mapDispatchToProps,
)(App);
