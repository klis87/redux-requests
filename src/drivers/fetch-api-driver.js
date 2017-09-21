import { call, all } from 'redux-saga/effects';

const prepareSuccessPayload = response => call([response, 'json']);

function* getSuccessPayload(response) {
  if (Array.isArray(response)) {
    const successPayloads = yield all(response.map(prepareSuccessPayload));
    return successPayloads;
  }

  const successPayload = yield prepareSuccessPayload(response);
  return successPayload;
}

const getErrorPayload = error => error;

const getRequestHandlers = (requestInstance) => {
  function* sendRequestSaga({ url, ...requestConfig }) {
    const response = yield call(requestInstance, url, requestConfig);

    if (!response.ok) {
      throw response;
    }

    return response;
  }

  return { sendRequest: sendRequestSaga };
};

const fetchApiDriver = {
  getSuccessPayload,
  getErrorPayload,
  getRequestHandlers,
};

export default fetchApiDriver;
