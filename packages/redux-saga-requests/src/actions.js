import { SUCCESS_SUFFIX, ERROR_SUFFIX, ABORT_SUFFIX } from './constants';

export const getActionWithSuffix = suffix => actionType => actionType + suffix;

export const success = getActionWithSuffix(SUCCESS_SUFFIX);
export const error = getActionWithSuffix(ERROR_SUFFIX);
export const abort = getActionWithSuffix(ABORT_SUFFIX);

const isFSA = action => !!action.payload;

export const successAction = (action, data) => ({
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

export const errorAction = (action, errorData) => ({
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

export const abortAction = action => ({
  meta: {
    ...action.meta,
    requestAction: action,
  },
});
