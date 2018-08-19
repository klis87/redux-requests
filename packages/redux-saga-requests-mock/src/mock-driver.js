const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const createDriver = (
  mockInstance,
  { timeout = 0, getDataFromResponse = response => response.data } = {},
) => ({
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
  getSuccessPayload(response) {
    if (Array.isArray(response)) {
      return response.map(getDataFromResponse);
    }

    return getDataFromResponse(response);
  },
  getErrorPayload(error) {
    return error;
  },
});
