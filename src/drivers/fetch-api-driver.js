import isAbsoluteUrl from 'axios/lib/helpers/isAbsoluteURL';

const prepareSuccessPayload = response => response.json();

const getSuccessPayload = (response) => {
  if (Array.isArray(response)) {
    return Promise.all(response.map(prepareSuccessPayload));
  }

  return prepareSuccessPayload(response);
};

const getErrorPayload = error => error;

const getRequestHandlers = (requestInstance, { baseURL = '' } = {}) => {
  const sendRequestSaga = async ({ url, ...requestConfig }) => {
    // TODO: add test
    const response = await requestInstance(isAbsoluteUrl(url) ? url : baseURL + url, requestConfig);

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
