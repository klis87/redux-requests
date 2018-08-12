import isAbsoluteUrl from 'axios/lib/helpers/isAbsoluteURL';

const responseTypes = ['arraybuffer', 'blob', 'formData', 'json', 'text', null];

const getResponseData = (response, responseType) => {
  if (responseTypes.indexOf(responseType) === -1) {
    throw new Error(
      "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text', null",
    );
  }

  if (responseType === null) {
    return Promise.resolve(null);
  }

  return response[responseType]();
};

const prepareSuccessPayload = response => response.data;

class DummyAbortController {
  /* eslint-disable-next-line class-methods-use-this */
  abort() {}
}

export const createDriver = (
  fetchInstance,
  { baseURL = '', AbortController = DummyAbortController } = {},
) => ({
  requestInstance: fetchInstance,
  getAbortSource() {
    return new AbortController();
  },
  abortRequest(abortSource) {
    abortSource.abort();
  },
  sendRequest: async (
    { url, responseType = 'json', ...requestConfig },
    abortSource,
  ) => {
    const response = await fetchInstance(
      isAbsoluteUrl(url) ? url : baseURL + url,
      { signal: abortSource.signal, ...requestConfig },
    );

    if (!response.ok) {
      try {
        response.data = await response.json();
      } catch (e) {
        // no response data from server
      }

      throw response;
    }

    response.data = await getResponseData(response, responseType);
    return response;
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
