import isAbsoluteUrl from 'axios/lib/helpers/isAbsoluteURL';

const responseTypes = ['arraybuffer', 'blob', 'formData', 'json', 'text', null];

const getResponseData = (response, responseType) => {
  if (responseTypes.indexOf(responseType) === -1) {
    throw new Error(
      "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text', null",
    );
  }

  if (responseType === null) {
    return Promise.resolve(null);
  }

  return response[responseType]();
};

class DummyAbortController {
  /* eslint-disable-next-line class-methods-use-this */
  abort() {}
}

export const createDriver = (
  fetchInstance,
  { baseURL = '', AbortController = DummyAbortController } = {},
) => ({ url, responseType = 'json', ...requestConfig }) => {
  const abortSource = new AbortController();
  const responsePromise = fetchInstance(
    isAbsoluteUrl(url) ? url : baseURL + url,
    { signal: abortSource.signal, ...requestConfig },
  )
    .then(response => {
      if (response.ok) {
        return getResponseData(response, responseType);
      }

      return response.json().then(
        data => {
          response.data = data;
          throw response;
        },
        () => {
          throw response;
        },
      );
    })
    .then(data => ({ data }));

  responsePromise.cancel = () => abortSource.abort();
  return responsePromise;
};
