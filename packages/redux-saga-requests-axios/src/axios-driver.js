import axios from 'axios';

export const createDriver = axiosInstance => ({
  requestInstance: axiosInstance,
  getAbortSource() {
    return axios.CancelToken.source();
  },
  abortRequest(abortSource) {
    abortSource.cancel();
  },
  sendRequest(requestConfig, abortSource) {
    // const abortSource = axios.CancelToken.source();

    const responsePromise = axiosInstance({
      cancelToken: abortSource.token,
      ...requestConfig,
    });

    // responsePromise.cancel = () => abortSource.cancel();
    return responsePromise.then(response => ({ data: response.data }));
  },
});
