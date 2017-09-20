import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  REQUEST_INSTANCE,
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

  describe('REQUEST_INSTANCE', () => {
    it('has correct value', () => {
      assert.equal(REQUEST_INSTANCE, 'REDUX_SAGA_REQUESTS_REQUEST_INSTANCE_CONTEXT');
    });
  });

  describe('INCORRECT_PAYLOAD_ERROR', () => {
    it('has correct value', () => {
      const expected = "Incorrect payload for request action. Action must have form of { type: 'TYPE', request: {} }, { type: 'TYPE', requests: [{}, {}] }, { type: 'TYPE', payload: { request: {} } } or { type: 'TYPE', payload: { requests: [{}, {}] } }";
      assert.equal(INCORRECT_PAYLOAD_ERROR, expected);
    });
  });
});
