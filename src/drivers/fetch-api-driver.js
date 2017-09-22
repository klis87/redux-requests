const prepareSuccessPayload = response => response.json();

const getSuccessPayload = (response) => {
  if (Array.isArray(response)) {
    return Promise.all(response.map(prepareSuccessPayload));
  }

  return prepareSuccessPayload(response);
};

const getErrorPayload = error => error;

const getRequestHandlers = (requestInstance) => {
  const sendRequestSaga = async ({ url, ...requestConfig }) => {
    const response = await requestInstance(url, requestConfig);

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
