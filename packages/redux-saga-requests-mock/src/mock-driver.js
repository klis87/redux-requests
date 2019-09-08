const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const createDriver = (mockInstance, { timeout = 0 } = {}) => ({
  requestInstance: mockInstance,
  getAbortSource() {
    return { cancel: () => true };
  },
  abortRequest(abortSource) {
    abortSource.cancel();
  },
  async sendRequest(requestConfig, abortSource, requestAction) {
    await sleep(timeout);
    return mockInstance[requestAction.type](requestConfig, requestAction);
  },
});
