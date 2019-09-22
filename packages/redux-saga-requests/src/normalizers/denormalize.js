export const denormalize = (data, normalizedData) => {
  if (typeof data === 'string' && data.startsWith('@@')) {
    return denormalize(normalizedData[data], normalizedData);
  }

  if (Array.isArray(data)) {
    return data.map(v => denormalize(v, normalizedData));
  }

  if (data !== null && typeof data === 'object') {
    return Object.entries(data).reduce((prev, [k, v]) => {
      prev[k] = denormalize(v, normalizedData);
      return prev;
    }, {});
  }

  return data;
};
