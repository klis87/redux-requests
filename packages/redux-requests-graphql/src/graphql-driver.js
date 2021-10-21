import axios from 'axios';
import { extractFiles } from 'extract-files';

const calculateProgress = progressEvent =>
  parseInt((progressEvent.loaded / progressEvent.total) * 100);

export const createDriver = ({ url, ...rest }) => {
  const axiosInstance = axios.create({
    baseURL: url,
    ...rest
  });

  return (requestConfig, requestAction, driverActions) => {
    const abortSource = axios.CancelToken.source();
    const { clone, files } = extractFiles({
      query: requestConfig.query,
      variables: requestConfig.variables,
    });
    let data;

    if (files.size === 0) {
      data = clone;
    } else {
      data = new FormData();
      data.append('operations', JSON.stringify(clone));

      let i = 0;
      const map = {};
      files.forEach(paths => {
        map[i++] = paths;
      });
      data.append('map', JSON.stringify(map));

      i = 0;
      files.forEach((paths, file) => {
        data.append(i++, file, file.name);
      });
    }

    const responsePromise = axiosInstance({
      cancelToken: abortSource.token,
      method: 'post',
      data,
      headers: requestConfig.headers,
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
    })
      .then(response => {
        if (response.data.errors) {
          throw response;
        } else {
          return response.data;
        }
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          throw 'REQUEST_ABORTED';
        }

        throw error;
      });

    responsePromise.cancel = () => abortSource.cancel();
    return responsePromise;
  };
};
