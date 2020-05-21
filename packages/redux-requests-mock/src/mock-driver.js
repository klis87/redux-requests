const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const createDriver = ({ timeout = 0 } = {}) => requestConfig => {
  return sleep(timeout).then(() => {
    if (requestConfig.response) {
      return requestConfig.response;
    }

    throw requestConfig.error;
  });
};
