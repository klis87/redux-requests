export const getActionPayload = action =>
  action.payload === undefined ? action : action.payload;

export const isRequestAction = action => {
  const actionPayload = getActionPayload(action);

  return (
    !!actionPayload &&
    !!actionPayload.request &&
    !!(actionPayload.request.length || actionPayload.request.url) &&
    !actionPayload.response &&
    !(actionPayload instanceof Error)
  );
};

export const mapRequest = (request, callback) =>
  Array.isArray(request) ? request.map(callback) : callback(request);
