export const denormalize = (data, normalizedData, dependencies, path = '') => {
  if (typeof data === 'string' && data.startsWith('@@')) {
    return denormalize(
      normalizedData[data],
      normalizedData,
      dependencies,
      path,
    );
  }

  if (Array.isArray(data)) {
    return data.map(v => denormalize(v, normalizedData, dependencies, path));
  }

  if (data !== null && typeof data === 'object') {
    const objectEntries = dependencies[path]
      ? Object.entries(data).filter(([k]) => dependencies[path].includes(k))
      : Object.entries(data);

    return objectEntries.reduce((prev, [k, v]) => {
      prev[k] = denormalize(v, normalizedData, dependencies, `${path}.${k}`);
      return prev;
    }, {});
  }

  return data;
};
