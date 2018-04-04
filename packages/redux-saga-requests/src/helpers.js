export const getActionPayload = action =>
  action.payload === undefined ? action : action.payload;

export const isRequestAction = action => {
  const actionPayload = getActionPayload(action);
  return !!actionPayload.request && !actionPayload.response;
};

export const mapRequest = (request, callback) =>
  Array.isArray(request) ? request.map(callback) : callback(request);
