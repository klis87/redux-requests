import React from 'react';

const Photo = ({ data: { title, thumbnailUrl } }) => (
  <div>
    <h3>{title}</h3>
    <img src={thumbnailUrl} alt={title} />
  </div>
);

export default Photo;
