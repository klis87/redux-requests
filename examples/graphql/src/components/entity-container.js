import React from 'react';

import Spinner from './spinner';

const EntityContainer = ({ error, isFetching, isFetched, children }) => {
  if (error) {
    return <p>There was some error during fetching. Please try again.</p>;
  }

  if (isFetching) {
    return <Spinner />;
  }

  if (!isFetched) {
    return <p>There is no entity currently.</p>;
  }

  return children;
};

export default EntityContainer;
