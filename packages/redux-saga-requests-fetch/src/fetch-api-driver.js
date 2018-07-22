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

const getSuccessPayload = response => {
  if (Array.isArray(response)) {
    return response.map(prepareSuccessPayload);
  }

  return prepareSuccessPayload(response);
};

const getErrorPayload = error => error;

class DummyAbortController {
  /* eslint-disable-next-line class-methods-use-this */
  abort() {}
}

const getRequestHandlers = (
  requestInstance,
  { baseURL = '', AbortController = DummyAbortController } = {},
) => {
  const controller = new AbortController();

  return {
    sendRequest: async ({ url, responseType = 'json', ...requestConfig }) => {
      const response = await requestInstance(
        isAbsoluteUrl(url) ? url : baseURL + url,
        { signal: controller.signal, ...requestConfig },
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
    abortRequest: controller.abort.bind(controller),
  };
};

const fetchApiDriver = {
  getSuccessPayload,
  getErrorPayload,
  getRequestHandlers,
};

export default fetchApiDriver;
