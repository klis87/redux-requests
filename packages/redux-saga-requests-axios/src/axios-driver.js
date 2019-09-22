import axios from 'axios';

export const createDriver = axiosInstance => requestConfig => {
  const abortSource = axios.CancelToken.source();

  const responsePromise = axiosInstance({
    cancelToken: abortSource.token,
    ...requestConfig,
  }).then(response => ({ data: response.data }));

  responsePromise.cancel = () => abortSource.cancel();
  return responsePromise;
};
