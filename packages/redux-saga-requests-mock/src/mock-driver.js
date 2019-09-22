const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const createDriver = (mockInstance, { timeout = 0 } = {}) => async (
  requestConfig,
  requestAction,
) => {
  await sleep(timeout);
  return mockInstance[requestAction.type](requestConfig, requestAction);
};
