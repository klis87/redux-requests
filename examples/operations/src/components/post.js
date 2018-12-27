import React from 'react';

const Post = ({
  data: { title, body },
  deletePost,
  deletePostOptimistic,
  deleting,
}) => (
  <div>
    <h3>{title}</h3>
    <p>{body}</p>
    <button onClick={deletePost} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
    <button onClick={deletePostOptimistic}>Delete optimistic</button>
    <hr />
  </div>
);

export default Post;
