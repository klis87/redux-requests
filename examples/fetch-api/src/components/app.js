import React from 'react';
import { connect } from 'react-redux';

import { fetchPosts, fetchPostWhichDoesntExist, clearPosts } from '../store/actions';
import {
  postsSelector,
  postsAreFetchingSelector,
  postsFetchErrorSelector,
  abortCounterSelector,
} from '../store/selectors';
import Posts from './posts';

const mapStateToProps = state => ({
  posts: postsSelector(state),
  postsAreFetching: postsAreFetchingSelector(state),
  postsFetchError: postsFetchErrorSelector(state),
  abortCounter: abortCounterSelector(state),
});

const mapDispatchToProps = {
  fetchPosts,
  fetchPostWhichDoesntExist,
  clearPosts,
};

const buttonStyle = { marginRight: 10 };

const App = ({
  posts,
  postsAreFetching,
  postsFetchError,
  abortCounter,
  fetchPosts,
  fetchPostWhichDoesntExist,
  clearPosts,
}) => (
  <div>
    <h1>Redux Saga Requests fetch api example</h1>
    <button style={buttonStyle} onClick={clearPosts}>Clear</button>
    <button style={buttonStyle} onClick={fetchPosts}>Fetch posts</button>
    <button style={buttonStyle} onClick={fetchPostWhichDoesntExist}>Fetch posts which doesnt exist</button>
    <span>Aborted counter: {abortCounter}</span>
    <div>
      <h2>Posts</h2>
      <Posts postsFetchError={postsFetchError} postsAreFetching={postsAreFetching} posts={posts} />
    </div>
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
