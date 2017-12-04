import { success, error } from './actions';

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

const defaultConfig = {
  getSuccessSuffix: success,
  getErrorSuffix: error,
  dataKey: 'data',
  errorKey: 'error',
  fetchingKey: 'fetching',
  multiple: false,
  onRequest: (state, action, { dataKey, multiple, fetchingKey, errorKey }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [fetchingKey]: true,
    [errorKey]: null,
  }),
  onSuccess: (state, action, { dataKey, fetchingKey, errorKey }) => ({
    ...state,
    [dataKey]: action.payload.data,
    [fetchingKey]: false,
    [errorKey]: null,
  }),
  onError: (state, action, { dataKey, multiple, fetchingKey, errorKey }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [fetchingKey]: false,
    [errorKey]: action.payload.error,
  }),
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
    onRequest,
    onSuccess,
    onError,
    getSuccessSuffix,
    getErrorSuffix,
    actionType,
  } = config;

  switch (action.type) {
    case actionType:
      return onRequest(state, action, config);
    case getSuccessSuffix(actionType):
      return onSuccess(state, action, config);
    case getErrorSuffix(actionType):
      return onError(state, action, config);
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
