import React from 'react';

import Post from './post';
import Spinner from './spinner';

const Posts = ({ postsFetchError, postsAreFetching, posts }) => {
  if (postsFetchError) {
    return <p>There was some error during last post fetching. Please try again.</p>;
  }

  if (postsAreFetching) {
    return <Spinner />;
  }

  if (posts.length === 0) {
    return <p>There is no post currently.</p>;
  }

  return <div>{posts.map(post => <Post key={post.id} title={post.title} body={post.body} />)}</div>;
};

export default Posts;
