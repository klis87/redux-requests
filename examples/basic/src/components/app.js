import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchPosts } from '../store/actions';
import { postsSelector, postsAreFetchingSelector } from '../store/selectors';
import Post from './post';
import Spinner from './spinner';

const mapStateToProps = state => ({
  posts: postsSelector(state),
  postsAreFetching: postsAreFetchingSelector(state),
});

const mapDispatchToProps = {
  fetchPosts,
};

class App extends Component {
  componentDidMount() {
    this.props.fetchPosts();
  }

  render() {
    const { posts, postsAreFetching } = this.props;

    return (
      <div>
        <h1>Redux Saga Requests basic example</h1>
        <h2>Posts</h2>
        {postsAreFetching ? (
          <Spinner />
        ) : (
          posts.map(post => <Post key={post.id} title={post.title} body={post.body} />)
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
