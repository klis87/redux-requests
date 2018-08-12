import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
} from './constants';

describe('constants', () => {
  describe('SUCCESS_SUFFIX', () => {
    it('has correct value', () => {
      assert.equal(SUCCESS_SUFFIX, '_SUCCESS');
    });
  });

  describe('ERROR_SUFFIX', () => {
    it('has correct value', () => {
      assert.equal(ERROR_SUFFIX, '_ERROR');
    });
  });

  describe('ABORT_SUFFIX', () => {
    it('has correct value', () => {
      assert.equal(ABORT_SUFFIX, '_ABORT');
    });
  });

  describe('REQUESTS_CONFIG', () => {
    it('has correct value', () => {
      assert.equal(REQUESTS_CONFIG, 'REDUX_SAGA_REQUESTS_CONFIG');
    });
  });

  describe('INCORRECT_PAYLOAD_ERROR', () => {
    it('has correct value', () => {
      const expected =
        "Incorrect payload for request action. Action must have form of { type: 'TYPE', request: {} }, { type: 'TYPE', request: [{}, {}] }, { type: 'TYPE', payload: { request: {} } } or { type: 'TYPE', payload: { request: [{}, {}] } }";
      assert.equal(INCORRECT_PAYLOAD_ERROR, expected);
    });
  });
});
