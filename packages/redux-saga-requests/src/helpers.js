export const getActionPayload = action =>
  action.payload === undefined ? action : action.payload;

export const isRequestAction = action => {
  const actionPayload = getActionPayload(action);
  return !!actionPayload.request && !!actionPayload.request.url;
};

export const mapRequest = (request, callback) =>
  Array.isArray(request) ? request.map(callback) : .callback(request);
