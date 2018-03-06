import sinon from 'sinon';

import fetchApiDriver from './fetch-api-driver';

describe('fetchApiDriver', () => {
  describe('getSuccessPayload', () => {
    const request = { responseType: 'json' };

    it('returns response data', async () => {
      const response = { json: () => 'data' };
      const actual = await fetchApiDriver.getSuccessPayload(response, request);
      assert.equal(actual, 'data');
    });

    it('returns array of response data', async () => {
      const response = [{ json: () => 'data1' }, { json: () => 'data2' }];
      const actual = await fetchApiDriver.getSuccessPayload(response, [
        request,
        request,
      ]);
      assert.deepEqual(actual, ['data1', 'data2']);
    });

    it('throws when responseType is incorrect', async () => {
      const response = { json: () => 'data' };
      let error;

      try {
        await fetchApiDriver.getSuccessPayload(response, {
          responseType: 'incorrect',
        });
      } catch (e) {
        error = e;
      }

      const expected =
        "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text'";
      assert.equal(error.message, expected);
    });

    it('supports default responseType as json', async () => {
      const response = { json: sinon.spy() };
      await fetchApiDriver.getSuccessPayload(response, {});
      assert.isTrue(response.json.calledOnce);
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
      const { sendRequest } = fetchApiDriver.getRequestHandlers(
        (url, config) => ({ ...response, url, ...config }),
      );
      const actual = await sendRequest({ url: 'url', x: 'x', y: 'y' });
      assert.deepEqual(actual, { ok: true, url: 'url', x: 'x', y: 'y' });
    });

    it('returns sendRequest handler which allows different domain than in baseURL', async () => {
      const response = { ok: true };
      const { sendRequest } = fetchApiDriver.getRequestHandlers(
        (url, config) => ({ ...response, url, ...config }),
        { baseURL: 'http://google.com/api' },
      );
      const url = 'http://youtube.com/api';
      const actual = await sendRequest({ url });
      assert.deepEqual(actual, { ok: true, url });
    });
  });
});
