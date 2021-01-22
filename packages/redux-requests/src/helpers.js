export const mapRequest = (request, callback) =>
  Array.isArray(request) ? request.map(callback) : callback(request);

export const mapObject = (obj, callback) =>
  Object.entries(obj).reduce((prev, [k, v]) => {
    const newValue = callback(k, v);

    if (newValue === undefined) {
      return prev;
    }

    prev[k] = newValue;
    return prev;
  }, {});
