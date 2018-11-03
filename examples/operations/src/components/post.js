import React from 'react';

const Post = ({ data: { title, body }, deletePost, deleting }) => (
  <div>
    <h3>{title}</h3>
    <p>{body}</p>
    <button onClick={deletePost} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
    <hr />
  </div>
);

export default Post;
