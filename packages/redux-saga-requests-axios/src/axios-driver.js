import axios from 'axios';

export const createDriver = axiosInstance => requestConfig => {
  const abortSource = axios.CancelToken.source();

  const responsePromise = axiosInstance({
    cancelToken: abortSource.token,
    ...requestConfig,
  })
    .then(response => ({ data: response.data }))
    .catch(error => {
      if (axios.isCancel(error)) {
        throw 'REQUEST_ABORTED';
      }

      throw error;
    });

  responsePromise.cancel = () => abortSource.cancel();
  return responsePromise;
};
