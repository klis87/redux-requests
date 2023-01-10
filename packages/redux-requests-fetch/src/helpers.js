// a real browser will throw an instance of `DomException`, polyfills an instance of `AbortError`
// https://developer.mozilla.org/en-US/docs/Web/API/AbortController#examples
// old browsers would set the exception `code` property equal to DOMException.ABORT_ERR
// https://developer.mozilla.org/en-US/docs/Web/API/DOMException/code
export const isNativeAbortError = err =>
  ['DOMException', 'AbortError'].includes(err.constructor.name) &&
  (err.name === 'AbortError' || err.code === DOMException.ABORT_ERR);

// taken from https://github.com/axios/axios/blob/v1.x/lib/helpers/isAbsoluteURL.js
export const isAbsoluteURL = url => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
