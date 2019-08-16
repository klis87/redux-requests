import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { fetchPhoto, clearPhoto, fetchPost, clearPost } from '../store/actions';
import EntityContainer from './entity-container';
import Photo from './photo';
import Post from './post';

const buttonStyle = { marginRight: 10 };

const App = () => {
  const photo = useSelector(state => state.photo.data);
  const photoIsFetched = useSelector(state => state.photo.data !== null);
  const photoIsFetching = useSelector(state => state.photo.fetching);
  const photoFetchError = useSelector(state => state.photo.error);
  const post = useSelector(state => state.post.data);
  const postIsFetched = useSelector(state => state.post.data !== null);
  const postIsFetching = useSelector(state => state.post.fetching);
  const postFetchError = useSelector(state => state.post.error);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Saga Requests low level reducers example</h1>
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
        <EntityContainer
          error={photoFetchError}
          isFetching={photoIsFetching}
          isFetched={photoIsFetched}
        >
          <Photo data={photo} />
        </EntityContainer>
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
        <EntityContainer
          error={postFetchError}
          isFetching={postIsFetching}
          isFetched={postIsFetched}
        >
          <Post data={post} />
        </EntityContainer>
      </div>
      <hr />
    </div>
  );
};

export default App;
