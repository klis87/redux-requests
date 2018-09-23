import {
  success,
  error,
  abort,
  isSuccessAction,
  isErrorAction,
  isAbortAction,
} from './actions';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const getEmptyData = multiple => (multiple ? [] : null);

const getInitialRequestState = ({ multiple, operations }) => ({
  data: getEmptyData(multiple),
  pending: 0,
  error: null,
  operations:
    operations &&
    Object.keys(operations).reduce(
      (prev, k) => ({ ...prev, [k]: { error: null, pending: 0 } }),
      {},
    ),
});

/*
const conf = {
  updateData: (state, action) => action.payload.data,
  operations: {
    UPDATE_NODE: (state, action) => action.payload.data,
    FETCH_AGAIN_NODE: true,
    EDIT_NODE: {
      updateData: (state, action) => action.payload.data,
      requestKey: action => action.meta.id,
    },
    DONT_UPDATE_DATA: false,
  },
};

const state = {
  data: 'dwdwd',
  pending: 0,
  error: false,
  operations: {
    UPDATE_NODE: {
      error: null,
      pending: 0,
    },
    FETCH_AGAIN_NODE: {
      error: null,
      pending: 0,
    },
    EDIT_NODE: {
      1: {
        error: true,
        pending: 0,
      },
      2: {
        error: false,
        pending: 1,
      },
    },
    DONT_UPDATE_DATA: {
      error: null,
      pending: 0,
    },
  },
};
*/

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
  operations: null,
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
    getData,
    operations,
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

  if (
    operations &&
    (action.type in operations ||
      (action.meta &&
        (action.meta.requestAction &&
          action.meta.requestAction.type in operations)))
  ) {
    if (isSuccessAction(action.type)) {
      const requestActionType = action.meta.requestAction.type;
      console.log('action type is', requestActionType);
      return {
        ...state,
        data: getData(state, action, config),
        operations: {
          ...state.operations,
          [requestActionType]: {
            error: null,
            pending: state.operations[requestActionType].pending - 1,
          },
        },
      };
    }

    return {
      ...state,
      operations: {
        ...state.operations,
        [action.type]: {
          error: null,
          pending: state.operations[action.type].pending + 1,
        },
      },
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
