import { success, error } from './actions';

const defaultConfig = {
  getSuccessSuffix: success,
  getErrorSuffix: error,
  dataKey: 'data',
  errorKey: 'error',
  fetchingKey: 'fetching',
  multiple: false,
};

const getEmptyData = multiple => multiple ? [] : null;

const getRequestState = ({ dataKey, errorKey, fetchingKey, multiple }) => ({
  [dataKey]: getEmptyData(multiple),
  [fetchingKey]: false,
  [errorKey]: null,
});

const getInitialState = (state, reducer, config) => {
  if (!reducer) {
    return getRequestState(config);
  }

  return { ...getRequestState(config), ...reducer(undefined, {}) };
};

export const createRequestsReducer = (
  globalConfig = {},
) => (
  localConfig,
  reducer = null,
) => (
  state,
  action,
) => {
  const config = { ...defaultConfig, ...globalConfig, ...localConfig };
  const nextState = state === undefined ? getInitialState(state, reducer, config) : state;

  const {
    getSuccessSuffix,
    getErrorSuffix,
    dataKey,
    errorKey,
    fetchingKey,
    multiple,
    actionType,
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
