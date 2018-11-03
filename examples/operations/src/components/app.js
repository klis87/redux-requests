import React from 'react';
import { connect } from 'react-redux';

import {
  fetchPhoto,
  deletePhoto,
  fetchPosts,
  deletePost,
} from '../store/actions';
import { DELETE_PHOTO, DELETE_POST } from '../store/constants';
import EntityContainer from './entity-container';
import Photo from './photo';
import Post from './post';

// You should use selectors here in your real projects, here we don't for simplicity
const mapStateToProps = state => ({
  photo: state.photo,
  posts: state.posts,
});

const mapDispatchToProps = {
  fetchPhoto,
  deletePhoto,
  fetchPosts,
  deletePost,
};

const buttonStyle = { marginRight: 10 };

const App = ({
  photo,
  fetchPhoto,
  deletePhoto,
  posts,
  fetchPosts,
  deletePost,
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
      <button style={buttonStyle} onClick={() => fetchPhoto(1)}>
        Fetch photo with id 1
      </button>
      <EntityContainer
        error={photo.error}
        isFetching={photo.pending > 0}
        isFetched={!!photo.data}
      >
        <Photo
          data={photo.data}
          deletePhoto={deletePhoto}
          deleting={photo.operations[DELETE_PHOTO].pending > 0}
        />
      </EntityContainer>
    </div>
    <hr />
    <div>
      <h2>Posts</h2>
      <button style={buttonStyle} onClick={fetchPosts}>
        Fetch posts
      </button>
      <EntityContainer
        error={posts.error}
        isFetching={posts.pending > 0}
        isFetched={posts.data.length > 0}
      >
        {posts.data.map(post => {
          const operation = posts.operations[DELETE_POST][post.id];

          return (
            <Post
              key={post.id}
              data={post}
              deletePost={() => deletePost(post.id)}
              deleting={operation && operation.pending > 0}
            />
          );
        })}
      </EntityContainer>
    </div>
    <hr />
  </div>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
