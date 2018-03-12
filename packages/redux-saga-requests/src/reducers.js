import {
  success as defaultSuccess,
  error as defaultError,
  abort as defaultAbort,
} from './actions';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const getEmptyData = multiple => (multiple ? [] : null);

const getInitialRequestState = ({
  dataKey,
  errorKey,
  pendingKey,
  multiple,
}) => ({
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
  success: defaultSuccess,
  error: defaultError,
  abort: defaultAbort,
  dataKey: 'data',
  errorKey: 'error',
  pendingKey: 'pending',
  multiple: false,
  getData: (state, action) =>
    action.payload ? action.payload.data : action.data,
  getError: (state, action) => (action.payload ? action.payload : action.error),
  onRequest: (state, action, { dataKey, multiple, pendingKey, errorKey }) => ({
    ...state,
    [dataKey]: getEmptyData(multiple),
    [pendingKey]: state[pendingKey] + 1,
    [errorKey]: null,
  }),
  onSuccess: (state, action, config) => {
    const { dataKey, pendingKey, errorKey, getData } = config;

    return {
      ...state,
      [dataKey]: getData(state, action, config),
      [pendingKey]: state[pendingKey] - 1,
      [errorKey]: null,
    };
  },
  onError: (state, action, config) => {
    const { dataKey, multiple, pendingKey, errorKey, getError } = config;

    return {
      ...state,
      [dataKey]: getEmptyData(multiple),
      [pendingKey]: state[pendingKey] - 1,
      [errorKey]: getError(state, action, config),
    };
  },
  onAbort: (state, action, { pendingKey }) => ({
    ...state,
    [pendingKey]: state[pendingKey] - 1,
  }),
  resetOn: [],
};

export const createRequestsReducer = (globalConfig = {}) => (
  localConfig,
  reducer = null,
) => (state, action) => {
  const config = { ...defaultConfig, ...globalConfig, ...localConfig };
  const nextState =
    state === undefined ? getInitialState(state, reducer, config) : state;

  const {
    onRequest,
    onSuccess,
    onError,
    onAbort,
    success,
    error,
    abort,
    resetOn,
    pendingKey,
    actionType,
  } = config;

  const normalizedActionType = normalizeActionType(actionType);

  if (
    (typeof resetOn === 'function' && resetOn(action)) ||
    (typeof resetOn !== 'function' &&
      resetOn.map(normalizeActionType).includes(action.type))
  ) {
    return {
      ...getInitialState(state, reducer, config),
      [pendingKey]: state[pendingKey],
    };
  }

  switch (action.type) {
    case normalizedActionType:
      return onRequest(state, action, config);
    case success(normalizedActionType):
      return onSuccess(state, action, config);
    case error(normalizedActionType):
      return onError(state, action, config);
    case abort(normalizedActionType):
      return onAbort(state, action, config);
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
