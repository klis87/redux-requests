import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  CLEAR_REQUESTS_CACHE,
} from './constants';

describe('constants', () => {
  describe('SUCCESS_SUFFIX', () => {
    it('has correct value', () => {
      expect(SUCCESS_SUFFIX).toBe('_SUCCESS');
    });
  });

  describe('ERROR_SUFFIX', () => {
    it('has correct value', () => {
      expect(ERROR_SUFFIX).toBe('_ERROR');
    });
  });

  describe('ABORT_SUFFIX', () => {
    it('has correct value', () => {
      expect(ABORT_SUFFIX).toBe('_ABORT');
    });
  });

  describe('CLEAR_REQUESTS_CACHE', () => {
    it('has correct value', () => {
      expect(CLEAR_REQUESTS_CACHE).toBe('CLEAR_REQUESTS_CACHE');
    });
  });
});
