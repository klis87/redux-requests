import fetchApiDriver from './fetch-api-driver';

describe('fetchApiDriver', () => {
  describe('getSuccessPayload', () => {
    it('returns response data', async () => {
      const response = { json: () => 'data' };
      const actual = await fetchApiDriver.getSuccessPayload(response);
      assert.equal(actual, 'data');
    });

    it('returns array of response data', async () => {
      const response = [{ json: () => 'data1' }, { json: () => 'data2' }];
      const actual = await fetchApiDriver.getSuccessPayload(response);
      assert.deepEqual(actual, ['data1', 'data2']);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      assert.equal(fetchApiDriver.getErrorPayload(error), error);
    });
  });

  describe('getRequestHandlers', () => {
    it('returns sendRequest handler', () => {
      const response = fetchApiDriver.getRequestHandlers();
      assert.hasAllKeys(response, ['sendRequest']);
    });

    it('returns sendRequest handler which throws error when response is not ok', async () => {
      const response = { ok: false };
      const { sendRequest } = fetchApiDriver.getRequestHandlers(() => response);
      let error;

      try {
        await sendRequest({});
      } catch (e) {
        error = e;
      }

      assert.deepEqual(error, response);
    });

    it('returns sendRequest handler which returns response when response is ok', async () => {
      const response = { ok: true };
      const { sendRequest } = fetchApiDriver.getRequestHandlers((url, config) => ({ ...response, url, ...config }));
      const actual = await sendRequest({ url: 'url', x: 'x', y: 'y' });
      assert.deepEqual(actual, { ok: true, url: 'url', x: 'x', y: 'y' });
    });
  });
});
