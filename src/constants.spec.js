import { REQUEST_INSTANCE } from './constants';

describe('constants', () => {
  describe('REQUEST_INSTANCE', () => {
    it('has correct value', () => {
      assert.equal(REQUEST_INSTANCE, 'REDUX_SAGA_REQUESTS_REQUEST_INSTANCE_CONTEXT');
    });
  });
});
