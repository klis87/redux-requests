export const SUCCESS_SUFFIX = '_SUCCESS';
export const ERROR_SUFFIX = '_ERROR';
export const ABORT_SUFFIX = '_ABORT';

export const getSuccessAction = actionType => actionType + SUCCESS_SUFFIX;
export const getErrorAction = actionType => actionType + ERROR_SUFFIX;
export const getAbortAction = actionType => actionType + ABORT_SUFFIX;
