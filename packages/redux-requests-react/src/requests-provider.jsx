import React, { useMemo } from 'react';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { Provider } from 'react-redux';
import { handleRequests } from '@redux-requests/core';

import RequestsContext from './requests-context';

const defaultGetMiddleware = requestsMiddleware => requestsMiddleware;

const RequestsProvider = ({
  children,
  requestsConfig,
  extraReducers,
  store: customStore,
  getMiddleware = defaultGetMiddleware,
  suspense = false,
  autoLoad = false,
  autoReset = false,
  throwError = false,
  suspenseSsr = false,
  getStore = undefined,
  initialState = undefined,
}) => {
  const contextValue = useMemo(
    () => ({
      suspense,
      autoLoad,
      autoReset,
      throwError,
      suspenseSsr,
    }),
    [suspense, autoLoad, autoReset, throwError, suspenseSsr],
  );

  const store = useMemo(() => {
    if (customStore) {
      return customStore;
    }

    const { requestsReducer, requestsMiddleware } = handleRequests(
      requestsConfig,
    );

    const reducers = combineReducers({
      requests: requestsReducer,
      ...extraReducers,
    });

    const composeEnhancers =
      (typeof window !== 'undefined' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
      compose;

    return createStore(
      reducers,
      initialState,
      composeEnhancers(applyMiddleware(...getMiddleware(requestsMiddleware))),
    );
  }, []);

  if (getStore) {
    getStore(store);
  }

  return (
    <Provider store={store}>
      <RequestsContext.Provider value={contextValue}>
        {children}
      </RequestsContext.Provider>
    </Provider>
  );
};

export default RequestsProvider;
