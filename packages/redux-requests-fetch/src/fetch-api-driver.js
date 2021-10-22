import isAbsoluteUrl from 'axios/lib/helpers/isAbsoluteURL';

import { isNativeAbortError } from './helpers';

const responseTypes = ['arraybuffer', 'blob', 'formData', 'json', 'text', null];

const getData = (response, responseType) => {
  if (responseType === null) {
    return Promise.resolve(null);
  }
  return response[responseType]();
};

const getResponse = (response, responseType) => {
  if (responseTypes.indexOf(responseType) === -1) {
    throw new Error(
      "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text', null",
    );
  }

  return getData(response, responseType).then(data => ({
    data,
    status: response.status,
    headers: response.headers,
  }));
};

class DummyAbortController {
  /* eslint-disable-next-line class-methods-use-this */
  abort() {}
}

export const createDriver = (
  fetchInstance,
  { baseURL = '', AbortController = DummyAbortController } = {},
) => ({ url, responseType = 'json', ...requestConfig }) => {
  const abortSource = new AbortController();
  const responsePromise = fetchInstance(
    isAbsoluteUrl(url) ? url : baseURL + url,
    { signal: abortSource.signal, ...requestConfig },
  ).then(response => {
    if (response.ok) {
      return getResponse(response, responseType);
    }

    return response.json().then(
      data => {
        response.data = data;
        throw response;
      },
      () => {
        throw response;
      },
    );
  }).catch(error => {
    if (isNativeAbortError(error)) {
      throw 'REQUEST_ABORTED';
    }

    throw error;
  });

  responsePromise.cancel = () => abortSource.abort();
  return responsePromise;
};
