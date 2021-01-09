import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { Provider } from 'react-redux';
import { handleRequests, createRequestsStore } from '@redux-requests/core';

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
      return createRequestsStore(customStore);
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

    return createRequestsStore(
      createStore(
        reducers,
        initialState,
        composeEnhancers(applyMiddleware(...getMiddleware(requestsMiddleware))),
      ),
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

RequestsProvider.propTypes = {
  children: PropTypes.func.isRequired,
  requestsConfig: PropTypes.any,
  extraReducers: PropTypes.any,
  store: PropTypes.any,
  getMiddleware: PropTypes.func,
  suspense: PropTypes.bool,
  autoLoad: PropTypes.bool,
  autoReset: PropTypes.bool,
  throwError: PropTypes.bool,
  suspenseSsr: PropTypes.bool,
  getStore: PropTypes.func,
  initialState: PropTypes.any,
};

export default RequestsProvider;
