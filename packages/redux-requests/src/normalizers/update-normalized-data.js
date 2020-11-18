import defaultConfig from '../default-config';

import { normalize } from './normalize';
import { mergeData } from './merge-data';

export const updateNormalizedData = (
  mutation,
  normalizedData,
  config = defaultConfig,
) => {
  const [, dataToMerge] = normalize(mutation, config);

  if (Object.keys(dataToMerge).length > 0) {
    const normalizedDataCopy = { ...normalizedData };

    Object.entries(dataToMerge).forEach(([k, v]) => {
      if (normalizedDataCopy[k]) {
        normalizedDataCopy[k] = mergeData(normalizedDataCopy[k], v);
      } else {
        normalizedDataCopy[k] = v;
      }
    });

    return normalizedDataCopy;
  }

  return normalizedData;
};
