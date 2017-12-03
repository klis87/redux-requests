import { success, error } from './actions';

const defaultConfig = {
  getSuccessSuffix: success,
  getErrorSuffix: error,
  dataKey: 'data',
  errorKey: 'error',
  fetchingKey: 'fetching',
};

const getRequestState = ({ dataKey, errorKey, fetchingKey }) => ({
  [dataKey]: null,
  [fetchingKey]: false,
  [errorKey]: null,
});

const getInitialState = (state, reducer, config) => {
  if (!reducer) {
    return getRequestState(config);
  }

  return { ...getRequestState(config), ...reducer(undefined, {}) };
};

export const createRequestsReducer = (userConfig = {}) => ({ actionType }, reducer = null) => (state, action) => {
  const config = { ...defaultConfig, ...userConfig };
  const nextState = state === undefined ? getInitialState(state, reducer, config) : state;

  const {
    getSuccessSuffix,
    getErrorSuffix,
    dataKey,
    errorKey,
    fetchingKey,
  } = config;

  switch (action.type) {
    case actionType:
      return {
        ...nextState,
        [dataKey]: null,
        [fetchingKey]: true,
        [errorKey]: null,
      };
    case getSuccessSuffix(actionType):
      return {
        ...nextState,
        [dataKey]: action.payload.data,
        [fetchingKey]: false,
        [errorKey]: null,
      };
    case getErrorSuffix(actionType):
      return {
        ...nextState,
        [dataKey]: null,
        [fetchingKey]: false,
        [errorKey]: action.payload.error,
      };
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
