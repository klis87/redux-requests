import React from 'react';
import { connect } from 'react-redux';
import { ConnectedRequestContainer } from 'redux-saga-requests-react';

import { fetchPhoto, clearPhoto, fetchPost, clearPost } from '../store/actions';
import Spinner from './spinner';
import Photo from './photo';
import Post from './post';

const mapDispatchToProps = {
  fetchPhoto,
  clearPhoto,
  fetchPost,
  clearPost,
};

const buttonStyle = { marginRight: 10 };

const RequestError = () => (
  <p>There was some error during fetching. Please try again.</p>
);

const App = ({ fetchPhoto, clearPhoto, fetchPost, clearPost }) => (
  <div>
    <h1>Redux Saga Requests basic example</h1>
    <p>
      In order to see aborts in action, you should set network throttling in
      your browser
    </p>
    <hr />
    <div>
      <h2>Photo</h2>
      <button style={buttonStyle} onClick={clearPhoto}>
        Clear
      </button>
      <button style={buttonStyle} onClick={() => fetchPhoto(1)}>
        Fetch photo with id 1
      </button>
      <button style={buttonStyle} onClick={() => fetchPhoto(10001)}>
        Fetch non-existent photo
      </button>
      <ConnectedRequestContainer
        requestSelector={state => state.photo}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data }) => <Photo data={data} />}
      </ConnectedRequestContainer>
    </div>
    <hr />
    <div>
      <h2>Post</h2>
      <button style={buttonStyle} onClick={clearPost}>
        Clear
      </button>
      <button style={buttonStyle} onClick={() => fetchPost(1)}>
        Fetch post with id 1
      </button>
      <button style={buttonStyle} onClick={() => fetchPost(1001)}>
        Fetch non-existent post
      </button>
      <ConnectedRequestContainer
        requestSelector={state => state.post}
        errorComponent={RequestError}
        loadingComponent={Spinner}
        noDataMessage={<p>There is no entity currently.</p>}
      >
        {({ data }) => <Post data={data} />}
      </ConnectedRequestContainer>
    </div>
    <hr />
  </div>
);

export default connect(
  null,
  mapDispatchToProps,
)(App);
