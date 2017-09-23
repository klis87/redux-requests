import React from 'react';

const Post = ({ data: { title, body, comments } }) => (
  <div>
    <h3>{title}</h3>
    <p>{body}</p>
    <div>
      <h4>Comments:</h4>
      {comments.map(comment => (
        <div key={comment.id}>
          <hr />
          <b>{comment.email} - {comment.name}</b>
          <div>{comment.body}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Post;
