import { setContext } from 'redux-saga/effects';

import { saveRequestInstance } from './sagas';
import { REQUEST_INSTANCE } from './constants';

describe('sagas', () => {
  describe('saveRequestInstance', () => {
    it('returns correct effect', () => {
      assert.deepEqual(saveRequestInstance({}), setContext({ [REQUEST_INSTANCE]: {} }));
    });
  });
});
