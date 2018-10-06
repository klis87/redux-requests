import { SUCCESS_SUFFIX, ERROR_SUFFIX, ABORT_SUFFIX } from './constants';

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
