import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  GET_REQUEST_CACHE,
  CLEAR_REQUESTS_CACHE,
} from './constants';

const getActionWithSuffix = suffix => actionType => actionType + suffix;

export const success = getActionWithSuffix(SUCCESS_SUFFIX);

export const error = getActionWithSuffix(ERROR_SUFFIX);

export const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = action => !!action.payload;

export const createSuccessAction = (action, data, response) => ({
  type: success(action.type),
  ...(isFSA(action)
    ? {
        payload: {
          data,
          response,
        },
      }
    : {
        data,
        response,
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

const isRequestQuery = request =>
  (!request.query &&
    (!request.method || request.method.toLowerCase() === 'get')) ||
  (request.query && !request.query.trim().startsWith('mutation'));

export const isRequestActionQuery = action => {
  const { request } = getActionPayload(action);

  if (action.meta && action.meta.asMutation !== undefined) {
    return !action.meta.asMutation;
  }

  return !!(Array.isArray(request)
    ? request.every(isRequestQuery)
    : isRequestQuery(request));
};

export const getRequestCache = () => ({ type: GET_REQUEST_CACHE });

export const clearRequestsCache = (...actionTypes) => ({
  type: CLEAR_REQUESTS_CACHE,
  actionTypes,
});
