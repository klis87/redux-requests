export const getDependentKeys = (
  data,
  normalizedData,
  usedKeys,
  dependentKeys,
  path = '',
) => {
  if (!dependentKeys) {
    dependentKeys = new Set();
  }

  if (typeof data === 'string' && data.startsWith('@@')) {
    dependentKeys.add(data);
    getDependentKeys(
      normalizedData[data],
      normalizedData,
      usedKeys,
      dependentKeys,
      path,
    );
  } else if (Array.isArray(data)) {
    data.forEach(v =>
      getDependentKeys(v, normalizedData, usedKeys, dependentKeys, path),
    );
  } else if (data !== null && typeof data === 'object') {
    const objectEntries = usedKeys[path]
      ? Object.entries(data).filter(([k]) => usedKeys[path].includes(k))
      : Object.entries(data);

    objectEntries.forEach(([k, v]) => {
      getDependentKeys(
        v,
        normalizedData,
        usedKeys,
        dependentKeys,
        `${path}.${k}`,
      );
    });
  }

  return dependentKeys;
};
