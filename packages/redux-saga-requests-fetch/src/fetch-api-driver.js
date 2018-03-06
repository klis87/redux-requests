import isAbsoluteUrl from 'axios/lib/helpers/isAbsoluteURL';

const responseTypes = ['arraybuffer', 'blob', 'formData', 'json', 'text'];

const prepareSuccessPayload = (response, { responseType = 'json' }) => {
  if (responseTypes.indexOf(responseType) === -1) {
    throw new Error(
      "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text'",
    );
  }

  return response[responseType]();
};

const getSuccessPayload = (response, request) => {
  if (Array.isArray(response)) {
    return Promise.all(
      response.map((responseItem, i) =>
        prepareSuccessPayload(responseItem, request[i]),
      ),
    );
  }

  return prepareSuccessPayload(response, request);
};

const getErrorPayload = error => error;

const getRequestHandlers = (requestInstance, { baseURL = '' } = {}) => {
  const sendRequestSaga = async ({ url, ...requestConfig }) => {
    const response = await requestInstance(
      isAbsoluteUrl(url) ? url : baseURL + url,
      requestConfig,
    );

    if (!response.ok) {
      throw response;
    }

    return response;
  };

  return { sendRequest: sendRequestSaga };
};

const fetchApiDriver = {
  getSuccessPayload,
  getErrorPayload,
  getRequestHandlers,
};

export default fetchApiDriver;
