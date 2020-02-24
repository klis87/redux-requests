export const defaultConfig = {
  getObjectKey: obj => obj.id,
  shouldObjectBeNormalized: obj => obj.id !== undefined,
};
