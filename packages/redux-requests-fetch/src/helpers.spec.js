import { isNativeAbortError } from './helpers';

describe('helpers', () => {
  describe('isNativeAbortError', () => {

    it('properly identifies a native `AbortError`', () => {
      expect(isNativeAbortError(new DOMException('request aborted', 'AbortError'))).toBe(true);
    });

    it('does not identify another Error', () => {
      expect(isNativeAbortError(new Error())).toBe(false);
    });

    it('does not identify a string', () => {
      expect(isNativeAbortError('REQUEST_ABORTED')).toBe(false);
    });
  });
});
