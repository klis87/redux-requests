import { mergeData } from './merge-data';

export const stipFromDeps = (data, root = true) => {
  if (Array.isArray(data)) {
    return data.map(v => stipFromDeps(v));
  }

  if (data !== null && typeof data === 'object') {
    if (data.id && root) {
      return `@@${data.id}`;
    }
    return Object.entries(data).reduce((prev, [k, v]) => {
      prev[k] = stipFromDeps(v);
      return prev;
    }, {});
  }

  return data;
};

export const getDependencies = (data, usedKeys, path = '') => {
  usedKeys = usedKeys || {};

  if (Array.isArray(data)) {
    return [
      data.reduce(
        (prev, current) => [
          ...prev,
          ...getDependencies(current, usedKeys, path)[0],
        ],
        [],
      ),
      usedKeys,
    ];
  }

  if (data !== null && typeof data === 'object') {
    if (data.id) {
      usedKeys[path] = Object.keys(data);
    }

    return [
      Object.entries(data).reduce(
        (prev, [k, v]) => [
          ...prev,
          ...getDependencies(v, usedKeys, `${path}.${k}`)[0],
        ],
        data.id ? [data] : [],
      ),
      usedKeys,
    ];
  }

  return [[], usedKeys];
};

export const normalize = data => {
  const [dependencies, usedKeys] = getDependencies(data);

  return [
    stipFromDeps(data, true),
    dependencies.reduce((prev, v) => {
      prev[`@@${v.id}`] = prev[`@@${v.id}`]
        ? mergeData(prev[`@@${v.id}`], stipFromDeps(v, false))
        : stipFromDeps(v, false);
      return prev;
    }, {}),
    usedKeys,
  ];
};
