import React, { useMemo } from 'react';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { Provider } from 'react-redux';
import { handleRequests } from '@redux-requests/core';

const defaultGetMiddleware = requestsMiddleware => requestsMiddleware;

const RequestsProvider = ({
  children,
  requestsConfig,
  extraReducers,
  getMiddleware = defaultGetMiddleware,
}) => {
  const store = useMemo(() => {
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
      composeEnhancers(applyMiddleware(...getMiddleware(requestsMiddleware))),
    );
  }, []);

  return <Provider store={store}>{children}</Provider>;
};

export default RequestsProvider;
