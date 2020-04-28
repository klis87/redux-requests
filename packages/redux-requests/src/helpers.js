export const mapRequest = (request, callback) =>
  Array.isArray(request) ? request.map(callback) : callback(request);
