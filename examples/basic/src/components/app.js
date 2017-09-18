import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchPosts } from '../store/actions';

const mapStateToProps = state => ({
  posts: state.posts,
});

const mapDispatchToProps = {
  fetchPosts,
};

class App extends Component {
  componentDidMount() {
    this.props.fetchPosts();
  }

  render() {
    return (
      <div>
        <h2>dewdwd</h2>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
