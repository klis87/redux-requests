import axios from 'axios';

const prepareSuccessPayload = response => response.data;

export const createDriver = axiosInstance => ({
  requestInstance: axiosInstance,
  getAbortSource() {
    return axios.CancelToken.source();
  },
  abortRequest(abortSource) {
    abortSource.cancel();
  },
  sendRequest(requestConfig, abortSource) {
    return axiosInstance({
      cancelToken: abortSource.token,
      ...requestConfig,
    });
  },
  getSuccessPayload(response) {
    if (Array.isArray(response)) {
      return response.map(prepareSuccessPayload);
    }

    return prepareSuccessPayload(response);
  },
  getErrorPayload(error) {
    return error;
  },
});
