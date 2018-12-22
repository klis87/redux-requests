import sinon from 'sinon';

import { createDriver } from './fetch-api-driver';

describe('fetchApiDriver', () => {
  class DummyAbortController {
    /* eslint-disable-next-line class-methods-use-this */
    abort() {}
  }

  const fetchInstance = requestConfig => requestConfig;
  const fetchDriver = createDriver(fetchInstance, {
    AbortController: DummyAbortController,
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('requestInstance', () => {
    it('has correct value', () => {
      expect(fetchDriver.requestInstance).toBe(fetchInstance);
    });
  });

  describe('getAbortSource', () => {
    it('returns new source', () => {
      expect(fetchDriver.getAbortSource()).toEqual(new DummyAbortController());
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { abort: sinon.fake() };
      fetchDriver.abortRequest(abortSource);
      expect(abortSource.abort.callCount).toBe(1);
    });

    it('doesnt crash when AbortController not provided', () => {
      const driver = createDriver(fetchInstance);
      const abortSource = driver.getAbortSource();
      driver.abortRequest(abortSource);
    });
  });

  describe('sendRequest', () => {
    it('throws when responseType is of incorrect type', async () => {
      const getResponse = sinon.fake.resolves('error');
      const requestInstance = sinon.fake.resolves({
        ok: true,
        json: getResponse,
      });
      const driver = createDriver(requestInstance);
      let error;

      try {
        await driver.sendRequest(
          { url: '/', responseType: 'notValidType' },
          { signal: 'signal' },
        );
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(
        "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text', null",
      );
    });

    it('returns response with data for successful request', async () => {
      const getResponse = sinon.fake.resolves('data');
      const requestInstance = sinon.fake.resolves({
        ok: true,
        json: getResponse,
      });
      const driver = createDriver(requestInstance);
      const response = await driver.sendRequest(
        { url: '/' },
        { signal: 'signal' },
      );

      expect(response).toEqual({
        ok: true,
        json: getResponse,
        data: 'data',
      });
    });

    it('returns response with data null for successful request when responseType as null', async () => {
      const requestInstance = sinon.fake.resolves({
        ok: true,
      });
      const driver = createDriver(requestInstance);
      const response = await driver.sendRequest(
        { url: '/', responseType: null },
        { signal: 'signal' },
      );

      expect(response).toEqual({
        ok: true,
        data: null,
      });
    });

    it('throws response with data for error request', async () => {
      const getResponse = sinon.fake.resolves('error');
      const requestInstance = sinon.fake.resolves({
        ok: false,
        json: getResponse,
      });
      const driver = createDriver(requestInstance);
      let error;

      try {
        await driver.sendRequest({ url: '/' }, { signal: 'signal' });
      } catch (e) {
        error = e;
      }

      expect(error).toEqual({
        ok: false,
        json: getResponse,
        data: 'error',
      });
    });

    it('calls fetchInstance with proper object', async () => {
      const requestInstance = sinon.fake.resolves({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance);
      await driver.sendRequest({ url: '/' }, { signal: 'signal' });
      expect(
        requestInstance.calledOnceWithExactly('/', { signal: 'signal' }),
      ).toBe(true);
    });

    it('uses baseURL for relative urls', async () => {
      const requestInstance = sinon.fake.resolves({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance, {
        baseURL: 'http://domain.com',
      });
      await driver.sendRequest({ url: '/' }, { signal: 'signal' });
      expect(
        requestInstance.calledOnceWithExactly('http://domain.com/', {
          signal: 'signal',
        }),
      ).toBe(true);
    });

    it('doesnt use baseURL for absolute urls', async () => {
      const requestInstance = sinon.fake.resolves({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance, {
        baseURL: 'http://domain.com',
      });
      await driver.sendRequest(
        { url: 'http://another-domain.com/' },
        { signal: 'signal' },
      );
      expect(
        requestInstance.calledOnceWithExactly('http://another-domain.com/', {
          signal: 'signal',
        }),
      ).toBe(true);
    });
  });

  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      expect(fetchDriver.getSuccessPayload(response)).toEqual(response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      expect(fetchDriver.getSuccessPayload(responses)).toEqual([
        responses[0].data,
        responses[1].data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      expect(fetchDriver.getErrorPayload(error)).toBe(error);
    });
  });
});
