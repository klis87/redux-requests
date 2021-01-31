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

const isFSA = action => !!action.payload;

export const createSuccessAction = (action, response) => ({
  type: success(action.type),
  ...(isFSA(action) ? { payload: response } : { response }),
  meta: {
    ...action.meta,
    requestAction: action,
  },
});

export const createErrorAction = (action, errorData) => ({
  type: error(action.type),
  ...(isFSA(action)
    ? {
        payload: errorData,
        error: true,
      }
    : {
        error: errorData,
      }),
  meta: {
    ...action.meta,
    requestAction: action,
  },
});

export const createAbortAction = action => ({
  type: abort(action.type),
  meta: {
    ...action.meta,
    requestAction: action,
  },
});

export const getActionPayload = action =>
  action.payload === undefined ? action : action.payload;

// eslint-disable-next-line import/no-unused-modules
export const getResponseFromSuccessAction = action =>
  action.payload ? action.payload : action.response;

export const isRequestAction = action => {
  const actionPayload = getActionPayload(action);

  return (
    !!actionPayload?.request &&
    !!(
      Array.isArray(actionPayload.request) ||
      actionPayload.request.url ||
      actionPayload.request.query ||
      actionPayload.request.promise ||
      actionPayload.request.response ||
      actionPayload.request.error
    ) &&
    !actionPayload.response &&
    !(actionPayload instanceof Error)
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

const isRequestQuery = request =>
  (!request.query &&
    (!request.method || request.method.toLowerCase() === 'get')) ||
  (request.query && !request.query.trim().startsWith('mutation'));

export const isRequestActionQuery = action => {
  const { request } = getActionPayload(action);

  if (action.meta?.asMutation !== undefined) {
    return !action.meta.asMutation;
  }

  return !!(Array.isArray(request)
    ? request.every(isRequestQuery)
    : isRequestQuery(request));
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
