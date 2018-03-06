import axios from 'axios';

const prepareSuccessPayload = response => response.data;

const getSuccessPayload = response => {
  if (Array.isArray(response)) {
    return response.map(prepareSuccessPayload);
  }

  return prepareSuccessPayload(response);
};

const getErrorPayload = error => error;

const getRequestHandlers = requestInstance => {
  const tokenSource = axios.CancelToken.source();

  return {
    sendRequest: requestConfig =>
      requestInstance({ cancelToken: tokenSource.token, ...requestConfig }),
    abortRequest: tokenSource.cancel,
  };
};

const axiosDriver = {
  getSuccessPayload,
  getErrorPayload,
  getRequestHandlers,
};

export default axiosDriver;
