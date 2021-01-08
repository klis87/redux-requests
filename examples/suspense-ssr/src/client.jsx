import '@babel/polyfill';
import React from 'react';
import axios from 'axios';
import { hydrate } from 'react-dom';
import { RequestsProvider } from '@redux-requests/react';
import { createDriver } from '@redux-requests/axios';

import App from './components/app';

const renderApp = () => {
  hydrate(
    <RequestsProvider
      requestsConfig={{
        driver: createDriver(
          axios.create({
            baseURL: 'http://localhost:3000',
          }),
        ),
        ssr: 'client',
      }}
      initialState={window.__INITIAL_STATE__}
      autoReset
      autoLoad
    >
      <App />
    </RequestsProvider>,
    document.getElementById('root'),
  );
};

renderApp();

if (module.hot) {
  module.hot.accept('./components/app', renderApp);
}
