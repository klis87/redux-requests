import { success, error, abort } from './actions';

const getEmptyData = multiple => multiple ? [] : null;

const getInitialRequestState = ({ dataKey, errorKey, pendingKey, multiple }) => ({
  [dataKey]: getEmptyData(multiple),
  [pendingKey]: 0,
  [errorKey]: null,
});

const getInitialState = (state, reducer, config) => {
  if (!reducer) {
    return getInitialRequestState(config);
  }

  return { ...getInitialRequestState(config), ...reducer(undefined, {}) };
};

const defaultConfig = {
  getSuccessSuffix: success,
  getErrorSuffix: error,
  getAbortSuffix: abort,
  dataKey: 'data',
  errorKey: 'error',
  pendingKey: 'pending',
  multiple: false,
  getData: (state, action) => action.payload.data,
  onRequest: (state, action, { dataKey, multiple, pendingKey, errorKey }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [pendingKey]: state[pendingKey] + 1,
    [errorKey]: null,
  }),
  onSuccess: (state, action, { dataKey, pendingKey, errorKey, getData }) => ({
    ...state,
    [dataKey]: getData(state, action),
    [pendingKey]: state[pendingKey] - 1,
    [errorKey]: null,
  }),
  onError: (state, action, { dataKey, multiple, pendingKey, errorKey }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [pendingKey]: state[pendingKey] - 1,
    [errorKey]: action.payload.error,
  }),
  onAbort: (state, action, { pendingKey }) => ({
    ...state,
    [pendingKey]: state[pendingKey] - 1,
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
    onAbort,
    getSuccessSuffix,
    getErrorSuffix,
    getAbortSuffix,
    actionType,
  } = config;

  switch (action.type) {
    case actionType:
      return onRequest(state, action, config);
    case getSuccessSuffix(actionType):
      return onSuccess(state, action, config);
    case getErrorSuffix(actionType):
      return onError(state, action, config);
    case getAbortSuffix(actionType):
      return onAbort(state, action, config);
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
