import { success, error, abort } from './actions';

describe('actions', () => {
  const SOME_ACTION = 'SOME_ACTION';

  describe('success', () => {
    it('should add success suffix', () => {
      assert.equal(success(SOME_ACTION), `${SOME_ACTION}_SUCCESS`);
    });
  });

  describe('error', () => {
    it('should add error suffix', () => {
      assert.equal(error(SOME_ACTION), `${SOME_ACTION}_ERROR`);
    });
  });

  describe('abort', () => {
    it('should add abort suffix', () => {
      assert.equal(abort(SOME_ACTION), `${SOME_ACTION}_ABORT`);
    });
  });
});
