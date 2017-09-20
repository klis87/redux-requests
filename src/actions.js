import { SUCCESS_SUFFIX, ERROR_SUFFIX, ABORT_SUFFIX } from './constants';

export const getActionWithSuffix = suffix => actionType => actionType + suffix;

export const success = getActionWithSuffix(SUCCESS_SUFFIX);
export const error = getActionWithSuffix(ERROR_SUFFIX);
export const abort = getActionWithSuffix(ABORT_SUFFIX);
