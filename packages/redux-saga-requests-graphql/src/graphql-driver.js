import axios from 'axios';
import { extractFiles } from 'extract-files';

const prepareSuccessPayload = response => response.data.data;

export const createDriver = ({ url }) => {
  const axiosInstance = axios.create({
    baseURL: url,
  });

  return {
    requestInstance: axiosInstance,
    getAbortSource() {
      return axios.CancelToken.source();
    },
    abortRequest(abortSource) {
      abortSource.cancel();
    },
    sendRequest(requestConfig, abortSource) {
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

      return axiosInstance({
        cancelToken: abortSource.token,
        method: 'post',
        data,
        headers: requestConfig.headers,
      }).then(response => {
        if (response.data.errors) {
          throw response;
        } else {
          return response;
        }
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
  };
};
