import {
  SUCCESS_SUFFIX,
  ERROR_SUFFIX,
  ABORT_SUFFIX,
  getSuccessAction,
  getErrorAction,
  getAbortAction,
} from './actions';

describe('action suffixes', () => {
  describe('SUCCESS_SUFFIX', () => {
    it('should have a correct value', () => {
      assert.equal(SUCCESS_SUFFIX, '_SUCCESS');
    });
  });

  describe('ERROR_SUFFIX', () => {
    it('should have a correct value', () => {
      assert.equal(ERROR_SUFFIX, '_ERROR');
    });
  });

  describe('ABORT_SUFFIX', () => {
    it('should have a correct value', () => {
      assert.equal(ABORT_SUFFIX, '_ABORT');
    });
  });
});

describe('action type transformers', () => {
  const SOME_ACTION = 'SOME_ACTION';

  describe('getSuccessAction', () => {
    it('should add success suffix', () => {
      assert.equal(getSuccessAction(SOME_ACTION), SOME_ACTION + SUCCESS_SUFFIX);
    });
  });

  describe('getErrorAction', () => {
    it('should add error suffix', () => {
      assert.equal(getErrorAction(SOME_ACTION), SOME_ACTION + ERROR_SUFFIX);
    });
  });

  describe('getAbortAction', () => {
    it('should add success suffix', () => {
      assert.equal(getAbortAction(SOME_ACTION), SOME_ACTION + ABORT_SUFFIX);
    });
  });
});
