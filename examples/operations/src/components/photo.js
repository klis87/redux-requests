import React from 'react';

const Photo = ({
  data: { id, title, thumbnailUrl },
  deletePhoto,
  deleting,
}) => (
  <div>
    <h3>{title}</h3>
    <img src={thumbnailUrl} alt={title} />
    <hr />
    <button onClick={() => deletePhoto(id)} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  </div>
);

export default Photo;
