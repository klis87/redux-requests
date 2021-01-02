import React from 'react';

const RequestsContext = React.createContext({
  suspense: false,
  suspenseSsr: false,
  autoLoad: false,
  autoReset: false,
});

export default RequestsContext;
