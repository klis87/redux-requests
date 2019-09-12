import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  REQUESTS_CONFIG,
  CLEAR_REQUESTS_CACHE,
  INCORRECT_PAYLOAD_ERROR,
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

  describe('REQUESTS_CONFIG', () => {
    it('has correct value', () => {
      expect(REQUESTS_CONFIG).toBe('REDUX_SAGA_REQUESTS_CONFIG');
    });
  });

  describe('CLEAR_REQUESTS_CACHE', () => {
    it('has correct value', () => {
      expect(CLEAR_REQUESTS_CACHE).toBe('CLEAR_REQUESTS_CACHE');
    });
  });

  describe('INCORRECT_PAYLOAD_ERROR', () => {
    it('has correct value', () => {
      expect(INCORRECT_PAYLOAD_ERROR).toBe(
        "Incorrect payload for request action. Action must have form of { type: 'TYPE', request: {} }, { type: 'TYPE', request: [{}, {}] }, { type: 'TYPE', payload: { request: {} } } or { type: 'TYPE', payload: { request: [{}, {}] } }",
      );
    });
  });
});
