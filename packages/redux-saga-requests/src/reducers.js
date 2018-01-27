import { success, error, abort } from './actions';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType => typeof actionType === 'function' ? actionType.toString() : actionType;

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
  getSuccessAction: success,
  getErrorAction: error,
  getAbortAction: abort,
  dataKey: 'data',
  errorKey: 'error',
  pendingKey: 'pending',
  multiple: false,
  fsa: false,
  getData: (state, action, { fsa }) => (fsa ? action.payload.data : action.data),
  getError: (state, action, { fsa }) => (fsa ? action.payload : action.error),
  onRequest: (state, action, { dataKey, multiple, pendingKey, errorKey }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [pendingKey]: state[pendingKey] + 1,
    [errorKey]: null,
  }),
  onSuccess: (state, action, { dataKey, pendingKey, errorKey, getData, fsa }) => ({
    ...state,
    [dataKey]: getData(state, action, { fsa }),
    [pendingKey]: state[pendingKey] - 1,
    [errorKey]: null,
  }),
  onError: (state, action, { dataKey, multiple, pendingKey, errorKey, getError, fsa }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [pendingKey]: state[pendingKey] - 1,
    [errorKey]: getError(state, action, { fsa }),
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
    getSuccessAction,
    getErrorAction,
    getAbortAction,
    actionType,
  } = config;

  const normalizedActionType = normalizeActionType(actionType);

  switch (action.type) {
    case normalizedActionType:
      return onRequest(state, action, config);
    case getSuccessAction(normalizedActionType):
      return onSuccess(state, action, config);
    case getErrorAction(normalizedActionType):
      return onError(state, action, config);
    case getAbortAction(normalizedActionType):
      return onAbort(state, action, config);
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
