export const createDriver = () => responsePromise => {
  return responsePromise.promise.then(response => {
    return ({ data: response });
  });
};
