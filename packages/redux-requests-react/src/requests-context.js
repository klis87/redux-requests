import React from 'react';

const RequestsContext = React.createContext({
  suspense: false,
  suspenseSsr: false,
  dispatch: false,
});

export default RequestsContext;
