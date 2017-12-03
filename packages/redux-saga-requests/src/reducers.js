import { success, error } from './actions';

const defaultConfig = {
  getSuccessSuffix: success,
  getErrorSuffix: error,
  dataKey: 'data',
  errorKey: 'error',
  fetchingKey: 'fetching',
};

const getEmptyData = multiple => multiple ? [] : null;

const getRequestState = ({ dataKey, errorKey, fetchingKey }, multiple) => ({
  [dataKey]: getEmptyData(multiple),
  [fetchingKey]: false,
  [errorKey]: null,
});

const getInitialState = (state, reducer, config, multiple) => {
  if (!reducer) {
    return getRequestState(config, multiple);
  }

  return { ...getRequestState(config, multiple), ...reducer(undefined, {}) };
};

export const createRequestsReducer = (
  userConfig = {},
) => (
  { actionType, multiple = false },
  reducer = null,
) => (
  state,
  action,
) => {
  const config = { ...defaultConfig, ...userConfig };
  const nextState = state === undefined ? getInitialState(state, reducer, config, multiple) : state;

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
        [dataKey]: getEmptyData(multiple),
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
        [dataKey]: getEmptyData(multiple),
        [fetchingKey]: false,
        [errorKey]: action.payload.error,
      };
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
