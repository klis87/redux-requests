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

export const getDependencies = data => {
  if (Array.isArray(data)) {
    return data.reduce(
      (prev, current) => [...prev, ...getDependencies(current)],
      [],
    );
  }

  if (data !== null && typeof data === 'object') {
    return Object.values(data).reduce(
      (prev, v) => [...prev, ...getDependencies(v)],
      data.id ? [data] : [],
    );
  }

  return [];
};

export const normalize = data => {
  const dependencies = getDependencies(data);

  return [
    stipFromDeps(data, true),
    dependencies.reduce((prev, v) => {
      prev[`@@${v.id}`] = prev[`@@${v.id}`]
        ? mergeData(prev[`@@${v.id}`], stipFromDeps(v, false))
        : stipFromDeps(v, false);
      return prev;
    }, {}),
  ];
};
