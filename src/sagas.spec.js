import { getContext, setContext } from 'redux-saga/effects';

import { getRequestInstance, saveRequestInstance } from './sagas';
import { REQUEST_INSTANCE } from './constants';

describe('sagas', () => {
  describe('saveRequestInstance', () => {
    it('returns correct effect', () => {
      assert.deepEqual(saveRequestInstance({}), setContext({ [REQUEST_INSTANCE]: {} }));
    });
  });

  describe('getRequestInstance', () => {
    it('returns correct effect', () => {
      assert.deepEqual(getRequestInstance({}), getContext(REQUEST_INSTANCE));
    });
  });
});
