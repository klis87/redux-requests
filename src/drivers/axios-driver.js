import { call } from 'redux-saga/effects';
import axios from 'axios';

const getSuccessPayload = (response) => {
  if (Array.isArray(response)) {
    return response.map(responseItem => responseItem.data);
  }

  return response.data;
};

const getErrorPayload = error => error;

const getRequestHandlers = (requestInstance) => {
  const tokenSource = axios.CancelToken.source();

  return {
    sendRequest: requestConfig => call(requestInstance, { cancelToken: tokenSource.token, ...requestConfig }),
    abortRequest: call([tokenSource, 'cancel']),
  };
};

const axiosDriver = {
  getSuccessPayload,
  getErrorPayload,
  getRequestHandlers,
};

export default axiosDriver;
