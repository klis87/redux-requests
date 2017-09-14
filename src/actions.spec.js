import {
  getSuffixes,
  updateSuffixes,
  getSuccessAction,
  getErrorAction,
  getAbortAction,
  success,
  error,
  abort,
} from './actions';

describe('action suffixes', () => {
  describe('getSuffixes', () => {
    afterEach(updateSuffixes);

    it('should return suffixes with correct default values', () => {
      const expected = {
        successSuffix: '_SUCCESS',
        errorSuffix: '_ERROR',
        abortSuffix: '_ABORT',
      };

      assert.deepEqual(getSuffixes(), expected);
    });

    it('should return suffixes with updated successSuffix', () => {
      const newSuccessSuffix = 'newSuccessSuffix';
      updateSuffixes({ successSuffix: newSuccessSuffix });

      const expected = {
        successSuffix: newSuccessSuffix,
        errorSuffix: '_ERROR',
        abortSuffix: '_ABORT',
      };

      assert.deepEqual(getSuffixes(), expected);
    });

    it('should return suffixes with updated errorSuffix', () => {
      const newErrorSuffix = 'newErrorSuffix';
      updateSuffixes({ errorSuffix: newErrorSuffix });

      const expected = {
        successSuffix: '_SUCCESS',
        errorSuffix: newErrorSuffix,
        abortSuffix: '_ABORT',
      };

      assert.deepEqual(getSuffixes(), expected);
    });

    it('should return suffixes with updated abortSuffix', () => {
      const newAbortSuffix = 'abortSuffix';
      updateSuffixes({ abortSuffix: newAbortSuffix });

      const expected = {
        successSuffix: '_SUCCESS',
        errorSuffix: '_ERROR',
        abortSuffix: newAbortSuffix,
      };

      assert.deepEqual(getSuffixes(), expected);
    });
  });
});

describe('action type transformers', () => {
  const SOME_ACTION = 'SOME_ACTION';

  describe('getSuccessAction', () => {
    it('should add success suffix', () => {
      assert.equal(getSuccessAction(SOME_ACTION), `${SOME_ACTION}_SUCCESS`);
    });

    it('should add default success suffix after updateSuffixes with custom error and abort suffixes', () => {
      updateSuffixes({ errorSuffix: 'customErrorSuffix', abortSuffix: 'customAbortSuffix' });
      assert.equal(getSuccessAction(SOME_ACTION), `${SOME_ACTION}_SUCCESS`);
      updateSuffixes();
    });

    it('should add custom success suffix after updateSuffixes', () => {
      const customSuffix = 'success';
      updateSuffixes({ successSuffix: customSuffix });
      assert.equal(getSuccessAction(SOME_ACTION), SOME_ACTION + customSuffix);
      updateSuffixes();
    });
  });

  describe('getErrorAction', () => {
    it('should add error suffix', () => {
      assert.equal(getErrorAction(SOME_ACTION), `${SOME_ACTION}_ERROR`);
    });
  });

  describe('getAbortAction', () => {
    it('should add success suffix', () => {
      assert.equal(getAbortAction(SOME_ACTION), `${SOME_ACTION}_ABORT`);
    });
  });
});

describe('action template strings', () => {
  const SOME_ACTION = 'SOME_ACTION';

  describe('success', () => {
    it('returns the same what getSuccessAction', () => {
      assert.equal(getSuccessAction(SOME_ACTION), success`${SOME_ACTION}`);
    });
  });

  describe('error', () => {
    it('returns the same what getErrorAction', () => {
      assert.equal(getErrorAction(SOME_ACTION), error`${SOME_ACTION}`);
    });
  });

  describe('abort', () => {
    it('returns the same what getAbortAction', () => {
      assert.equal(getAbortAction(SOME_ACTION), abort`${SOME_ACTION}`);
    });
  });
});
