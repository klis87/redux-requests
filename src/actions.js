const suffixes = {
  successSuffix: '_SUCCESS',
  errorSuffix: '_ERROR',
  abortSuffix: '_ABORT',
};

export const getSuccessAction = actionType => actionType + suffixes.successSuffix;
export const getErrorAction = actionType => actionType + suffixes.errorSuffix;
export const getAbortAction = actionType => actionType + suffixes.abortSuffix;

export const success = (strings, action) => getSuccessAction(action);
export const error = (strings, action) => getErrorAction(action);
export const abort = (strings, action) => getAbortAction(action);

export const getSuffixes = () => suffixes;

export const updateSuffixes = ({
  successSuffix = '_SUCCESS',
  errorSuffix = '_ERROR',
  abortSuffix = '_ABORT',
} = {}) => {
  suffixes.successSuffix = successSuffix;
  suffixes.errorSuffix = errorSuffix;
  suffixes.abortSuffix = abortSuffix;
};
