import React from 'react';
import { connect } from 'react-redux';

import { fetchPhoto, clearPhoto, fetchPost, clearPost } from '../store/actions';
import EntityContainer from './entity-container';
import Photo from './photo';
import Post from './post';

// You should use selectors here in your real projects, here we don't for simplicity
const mapStateToProps = state => ({
  photo: state.photo.data,
  photoIsFetched: state.photo.data !== null,
  photoIsFetching: state.photo.fetching,
  photoFetchError: state.photo.error,
  post: state.post.data,
  postIsFetched: state.post.data !== null,
  postIsFetching: state.post.fetching,
  postFetchError: state.post.error,
  abortCounter: state.abortCounter,
});

const mapDispatchToProps = {
  fetchPhoto,
  clearPhoto,
  fetchPost,
  clearPost,
};

const buttonStyle = { marginRight: 10 };

const App = ({
  photo,
  photoIsFetched,
  photoIsFetching,
  photoFetchError,
  post,
  postIsFetched,
  postIsFetching,
  postFetchError,
  fetchPhoto,
  clearPhoto,
  fetchPost,
  clearPost,
  abortCounter,
}) => (
  <div>
    <h1>Redux Saga Requests advanced example</h1>
    <hr />
    <div>
      <span>Abort counter: {abortCounter}</span>
    </div>
    <hr />
    <div>
      <h2>Photo</h2>
      <button style={buttonStyle} onClick={clearPhoto}>Clear</button>
      <button style={buttonStyle} onClick={() => fetchPhoto(1)}>Fetch photo with id 1</button>
      <button style={buttonStyle} onClick={() => fetchPhoto(10001)}>Fetch non-existent photo</button>
      <EntityContainer error={photoFetchError} isFetching={photoIsFetching} isFetched={photoIsFetched}>
        <Photo data={photo} />
      </EntityContainer>
    </div>
    <hr />
    <div>
      <h2>Post</h2>
      <button style={buttonStyle} onClick={clearPost}>Clear</button>
      <button style={buttonStyle} onClick={() => fetchPost(1)}>Fetch post with id 1</button>
      <button style={buttonStyle} onClick={() => fetchPost(1001)}>Fetch non-existent post</button>
      <EntityContainer error={postFetchError} isFetching={postIsFetching} isFetched={postIsFetched}>
        <Post data={post} />
      </EntityContainer>
    </div>
    <hr />
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
