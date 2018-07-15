import fetchApiDriver from './fetch-api-driver';

describe('fetchApiDriver', () => {
  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      assert.deepEqual(
        fetchApiDriver.getSuccessPayload(response),
        response.data,
      );
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      assert.deepEqual(fetchApiDriver.getSuccessPayload(responses), [
        responses[0].data,
        responses[1].data,
      ]);
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
      const json = () => 'data';
      const response = { ok: true, json };
      const { sendRequest } = fetchApiDriver.getRequestHandlers(
        (url, config) => ({ ...response, url, ...config }),
      );
      const actual = await sendRequest({ url: 'url', x: 'x', y: 'y' });
      assert.deepEqual(actual, {
        ok: true,
        url: 'url',
        x: 'x',
        y: 'y',
        json,
        data: 'data',
      });
    });

    it('returns sendRequest handler which doesnt read response stream when responseType is null', async () => {
      const json = () => 'data';
      const response = { ok: true, json };
      const { sendRequest } = fetchApiDriver.getRequestHandlers(
        (url, config) => ({ ...response, url, ...config }),
      );
      const actual = await sendRequest({ url: 'url', responseType: null });
      assert.deepEqual(actual, {
        ok: true,
        url: 'url',
        json,
        data: null,
      });
    });

    it('returns sendRequest handler which throws error when responseType is invalid', async () => {
      const response = { ok: true };
      const { sendRequest } = fetchApiDriver.getRequestHandlers(
        (url, config) => ({ ...response, url, ...config }),
      );

      let error;

      try {
        await sendRequest({ url: 'url', responseType: 'invalid' });
      } catch (e) {
        error = e;
      }

      const expected =
        "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text', null";
      assert.equal(error.message, expected);
    });

    it('returns sendRequest handler which allows different domain than in baseURL', async () => {
      const json = () => 'data';
      const response = { ok: true, json };
      const { sendRequest } = fetchApiDriver.getRequestHandlers(
        (url, config) => ({ ...response, url, ...config }),
        { baseURL: 'http://google.com/api' },
      );
      const url = 'http://youtube.com/api';
      const actual = await sendRequest({ url });
      assert.deepEqual(actual, { ok: true, url, json, data: 'data' });
    });
  });
});
