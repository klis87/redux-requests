import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  CLEAR_REQUESTS_CACHE,
} from './constants';

const getActionWithSuffix = suffix => actionType => actionType + suffix;

export const success = getActionWithSuffix(SUCCESS_SUFFIX);

export const error = getActionWithSuffix(ERROR_SUFFIX);

export const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = action => !!action.payload;

export const createSuccessAction = (action, data) => ({
  type: success(action.type),
  ...(isFSA(action)
    ? {
        payload: {
          data,
        },
      }
    : {
        data,
      }),
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

export const isRequestAction = action => {
  const actionPayload = getActionPayload(action);

  return (
    !!actionPayload &&
    !!actionPayload.request &&
    !!(
      Array.isArray(actionPayload.request) ||
      actionPayload.request.url ||
      actionPayload.request.query
    ) &&
    !actionPayload.response &&
    !(actionPayload instanceof Error)
  );
};

export const isResponseAction = action =>
  !!(action.meta && action.meta.requestAction);

export const getRequestActionFromResponse = action => action.meta.requestAction;

export const isSuccessAction = action =>
  isResponseAction(action) && action.type.endsWith(SUCCESS_SUFFIX);

export const isErrorAction = action =>
  isResponseAction(action) && action.type.endsWith(ERROR_SUFFIX);

export const isAbortAction = action =>
  isResponseAction(action) && action.type.endsWith(ABORT_SUFFIX);

export const clearRequestsCache = (...actionTypes) => ({
  type: CLEAR_REQUESTS_CACHE,
  actionTypes,
});
