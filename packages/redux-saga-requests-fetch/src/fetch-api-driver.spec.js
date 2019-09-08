import { createDriver } from './fetch-api-driver';

describe('fetchApiDriver', () => {
  class DummyAbortController {
    constructor() {
      this.signal = 'signal';
      this.abort = jest.fn();
    }
  }

  describe('requestInstance', () => {
    it('has correct value', () => {
      const fetchInstance = requestConfig => requestConfig;
      const fetchDriver = createDriver(fetchInstance);
      expect(fetchDriver.requestInstance).toBe(fetchInstance);
    });
  });

  describe('sendRequest', () => {
    it('throws when responseType is of incorrect type', async () => {
      const getResponse = jest.fn().mockResolvedValue('error');
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: getResponse,
      });
      const driver = createDriver(requestInstance);
      let error;

      try {
        await driver.sendRequest({ url: '/', responseType: 'notValidType' });
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe(
        "responseType must be one of the following: 'arraybuffer', 'blob', 'formData', 'json', 'text', null",
      );
    });

    it('returns response with data for successful request', async () => {
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue('data'),
      });
      const driver = createDriver(requestInstance);
      const response = await driver.sendRequest({ url: '/' });

      expect(response).toEqual({
        data: 'data',
      });
    });

    it('returns response with data null for successful request when responseType as null', async () => {
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
      });
      const driver = createDriver(requestInstance);
      const response = await driver.sendRequest({
        url: '/',
        responseType: null,
      });

      expect(response).toEqual({
        data: null,
      });
    });

    it('throws response with data for error request', async () => {
      const getResponse = jest.fn().mockResolvedValue('error');
      const requestInstance = jest.fn().mockResolvedValue({
        ok: false,
        json: getResponse,
      });
      const driver = createDriver(requestInstance);
      let error;

      try {
        await driver.sendRequest({ url: '/' });
      } catch (e) {
        error = e;
      }

      expect(error).toEqual({
        ok: false,
        json: getResponse,
        data: 'error',
      });
    });

    it('throws response without data for error request and errored json', async () => {
      const getResponse = jest.fn().mockRejectedValue('error');
      const requestInstance = jest.fn().mockResolvedValue({
        ok: false,
        json: getResponse,
      });
      const driver = createDriver(requestInstance);
      let error;

      try {
        await driver.sendRequest({ url: '/' });
      } catch (e) {
        error = e;
      }

      expect(error).toEqual({
        ok: false,
        json: getResponse,
      });
    });

    it('calls fetchInstance with proper object', async () => {
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance, {
        AbortController: DummyAbortController,
      });
      await driver.sendRequest({ url: '/' });
      expect(requestInstance).toBeCalledWith('/', { signal: 'signal' });
    });

    it('calls fetchInstance without signal with default AbortController', async () => {
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance);
      await driver.sendRequest({ url: '/' });
      expect(requestInstance).toBeCalledWith('/', { signal: undefined });
    });

    it('returns promise with cancel function which aborts request', async () => {
      const abort = jest.fn();

      class LocalDummyAbortController {
        constructor() {
          this.signal = 'signal';
          this.abort = abort;
        }
      }

      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance, {
        AbortController: LocalDummyAbortController,
      });
      const promise = driver.sendRequest({ url: '/' });
      expect(abort).not.toHaveBeenCalled();
      promise.cancel();
      expect(abort).toHaveBeenCalledTimes(1);
    });

    it('uses baseURL for relative urls', async () => {
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance, {
        baseURL: 'http://domain.com',
        AbortController: DummyAbortController,
      });
      await driver.sendRequest({ url: '/' });
      expect(requestInstance).toBeCalledWith('http://domain.com/', {
        signal: 'signal',
      });
    });

    it('doesnt use baseURL for absolute urls', async () => {
      const requestInstance = jest.fn().mockResolvedValue({
        ok: true,
        json: () => {},
      });
      const driver = createDriver(requestInstance, {
        baseURL: 'http://domain.com',
        AbortController: DummyAbortController,
      });
      await driver.sendRequest({ url: 'http://another-domain.com/' });
      expect(requestInstance).toBeCalledWith('http://another-domain.com/', {
        signal: 'signal',
      });
    });
  });
});
