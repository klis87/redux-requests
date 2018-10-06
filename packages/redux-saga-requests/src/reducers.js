import { success, error, abort } from './actions';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const getEmptyData = multiple => (multiple ? [] : null);

const getInitialRequestState = ({ multiple }) => ({
  data: getEmptyData(multiple),
  pending: 0,
  error: null,
});

const getInitialState = (state, reducer, config) => {
  if (!reducer) {
    return getInitialRequestState(config);
  }

  return { ...getInitialRequestState(config), ...reducer(undefined, {}) };
};

const defaultConfig = {
  multiple: false,
  getData: (state, action) =>
    action.payload ? action.payload.data : action.data,
  getError: (state, action) => (action.payload ? action.payload : action.error),
  onRequest: state => ({
    ...state,
    pending: state.pending + 1,
    error: null,
  }),
  onSuccess: (state, action, config) => ({
    ...state,
    data: config.getData(state, action, config),
    pending: state.pending - 1,
    error: null,
  }),
  onError: (state, action, config) => ({
    ...state,
    data: getEmptyData(config.multiple),
    pending: state.pending - 1,
    error: config.getError(state, action, config),
  }),
  onAbort: state => ({
    ...state,
    pending: state.pending - 1,
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
    resetOn,
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
      pending: state.pending,
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
