import '@babel/polyfill';
import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';

import { configureStore } from './store';
import App from './components/app';

const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);
store.runSaga();

const renderApp = () => {
  hydrate(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
};

renderApp();

if (module.hot) {
  module.hot.accept('./components/app', renderApp);
}
