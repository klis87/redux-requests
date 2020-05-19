const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const createDriver = (mockInstance, { timeout = 0 } = {}) => (
  requestConfig,
  requestAction,
) => {
  return sleep(timeout).then(() =>
    mockInstance[requestAction.type](requestConfig, requestAction),
  );
};
