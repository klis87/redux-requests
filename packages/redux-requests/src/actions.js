import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  CLEAR_REQUESTS_CACHE,
  RESET_REQUESTS,
  ABORT_REQUESTS,
  SET_DOWNLOAD_PROGRESS,
  SET_UPLOAD_PROGRESS,
  ADD_WATCHER,
  REMOVE_WATCHER,
  JOIN_REQUEST,
  STOP_POLLING,
  WEBSOCKET_OPENED,
  WEBSOCKET_CLOSED,
  GET_WEBSOCKET,
  OPEN_WEBSOCKET,
  CLOSE_WEBSOCKET,
  STOP_SUBSCRIPTIONS,
} from './constants';

const getActionWithSuffix = suffix => actionType => actionType + suffix;

export const success = getActionWithSuffix(SUCCESS_SUFFIX);

export const error = getActionWithSuffix(ERROR_SUFFIX);

export const abort = getActionWithSuffix(ABORT_SUFFIX);

export const createSuccessAction = (action, response) => ({
  type: success(action.type),
  response,
  meta: {
    ...action.meta,
    requestType: undefined,
    requestAction: action,
  },
});

export const createErrorAction = (action, errorData) => ({
  type: error(action.type),
  error: errorData,
  meta: {
    ...action.meta,
    requestType: undefined,
    requestAction: action,
  },
});

export const createAbortAction = action => ({
  type: abort(action.type),
  meta: {
    ...action.meta,
    requestType: undefined,
    requestAction: action,
  },
});

export const isRequestAction = action => {
  return (
    action?.meta?.requestType === 'QUERY' ||
    action?.meta?.requestType === 'MUTATION'
  );
};

export const isResponseAction = action => !!action.meta?.requestAction;

export const getRequestActionFromResponse = action => action.meta.requestAction;

export const isSuccessAction = action =>
  isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

export const isErrorAction = action =>
  isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);

export const isAbortAction = action =>
  isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);

export const isRequestActionQuery = action => {
  return action?.meta?.requestType === 'QUERY';
};

export const isRequestActionMutation = action => {
  return action?.meta?.requestType === 'MUTATION';
};

export const isRequestActionLocalMutation = action => {
  return action?.meta?.requestType === 'LOCAL_MUTATION';
};

export const isRequestActionSubscription = action => {
  return action?.meta?.requestType === 'SUBSCRIPTION';
};

export const clearRequestsCache = (requests = null) => ({
  type: CLEAR_REQUESTS_CACHE,
  requests,
});

export const resetRequests = (
  requests = null,
  abortPending = true,
  resetCached = true,
) => ({
  type: RESET_REQUESTS,
  requests,
  abortPending,
  resetCached,
});

export const abortRequests = (requests = null) => ({
  type: ABORT_REQUESTS,
  requests,
});

export const stopPolling = (requests = null) => ({
  type: STOP_POLLING,
  requests,
});

export const setDownloadProgress = (requestType, progress) => ({
  type: SET_DOWNLOAD_PROGRESS,
  requestType,
  progress,
});

export const setUploadProgress = (requestType, progress) => ({
  type: SET_UPLOAD_PROGRESS,
  requestType,
  progress,
});

export const addWatcher = requestType => ({
  type: ADD_WATCHER,
  requestType,
});

export const removeWatcher = requestType => ({
  type: REMOVE_WATCHER,
  requestType,
});

export const joinRequest = (requestType, rehydrate = false) => ({
  type: JOIN_REQUEST,
  requestType,
  rehydrate,
});

export const websocketOpened = () => ({ type: WEBSOCKET_OPENED });

export const websocketClosed = code => ({ type: WEBSOCKET_CLOSED, code });

export const getWebsocket = () => ({ type: GET_WEBSOCKET });

export const openWebsocket = (props = null) => ({
  type: OPEN_WEBSOCKET,
  props,
});

export const closeWebsocket = (code = 1000) => ({
  type: CLOSE_WEBSOCKET,
  code,
});

export const stopSubscriptions = (subscriptions = null) => ({
  type: STOP_SUBSCRIPTIONS,
  subscriptions,
});
