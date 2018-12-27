import React from 'react';

const Photo = ({ data, deletePhoto, deletePhotoOptimistic, deleting }) => (
  <div>
    <h3>{data.title}</h3>
    <img src={data.thumbnailUrl} alt={data.title} />
    <hr />
    <button onClick={() => deletePhoto(data.id)} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
    <button onClick={() => deletePhotoOptimistic(data)}>
      Delete optimistic
    </button>
  </div>
);

export default Photo;
