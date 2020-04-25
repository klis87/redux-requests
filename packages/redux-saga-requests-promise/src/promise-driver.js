class DummyAbortController {
  constructor() {
    this.signal = {
      addEventListener: () => {},
    };
  }

  /* eslint-disable-next-line class-methods-use-this */
  abort() {}
}

const getDefaultAbortController = () =>
  typeof AbortController === 'undefined'
    ? DummyAbortController
    : AbortController;

export const createDriver = ({
  AbortController = getDefaultAbortController(),
  processResponse = response => ({ data: response }),
} = {}) => requestConfig => {
  /**
   * To implement abort for any JavaScript Promise
   * @see https://medium.com/@bramus/cancel-a-javascript-promise-with-abortcontroller-3540cbbda0a9
   */
  const abortSource = new AbortController();

  const responsePromise = new Promise((resolve, reject) => {
    requestConfig.promise
      .then(response => {
        resolve(processResponse(response));
      })
      .catch(reject);
    abortSource.signal.addEventListener('abort', () => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('REQUEST_ABORTED');
    });
  });

  responsePromise.cancel = () => abortSource.abort();

  return responsePromise;
};
