import axios from 'axios';

const calculateProgress = progressEvent =>
  parseInt((progressEvent.loaded / progressEvent.total) * 100);

export const createDriver = axiosInstance => (
  requestConfig,
  requestAction,
  driverActions,
) => {
  const abortSource = axios.CancelToken.source();

  const responsePromise = axiosInstance({
    cancelToken: abortSource.token,
    onDownloadProgress:
      driverActions.setDownloadProgress &&
      (progressEvent => {
        if (progressEvent.lengthComputable) {
          driverActions.setDownloadProgress(calculateProgress(progressEvent));
        }
      }),
    onUploadProgress:
      driverActions.setUploadProgress &&
      (progressEvent => {
        if (progressEvent.lengthComputable) {
          driverActions.setUploadProgress(calculateProgress(progressEvent));
        }
      }),
    ...requestConfig,
  })
    .then(response => ({
      data: response.data,
      status: response.status,
      headers: response.headers,
    }))
    .catch(error => {
      if (axios.isCancel(error)) {
        throw 'REQUEST_ABORTED';
      }

      throw error;
    });

  responsePromise.cancel = () => abortSource.cancel();
  return responsePromise;
};
