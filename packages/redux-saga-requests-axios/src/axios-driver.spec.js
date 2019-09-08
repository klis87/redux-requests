import axios from 'axios';

import { createDriver } from './axios-driver';

jest.mock('axios');

describe('axiosDriver', () => {
  const axiosInstance = jest
    .fn()
    .mockResolvedValue({ data: 'data', status: 200 });
  const axiosDriver = createDriver(axiosInstance);

  describe('requestInstance', () => {
    it('has correct value', () => {
      expect(axiosDriver.requestInstance).toBe(axiosInstance);
    });
  });

  describe('getAbortSource', () => {
    it('returns new source', () => {
      const tokenSource = {
        token: 'token',
        cancel: () => 'cancelled',
      };

      axios.CancelToken.source.mockReturnValue(tokenSource);
      expect(axiosDriver.getAbortSource()).toBe(tokenSource);
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { cancel: jest.fn() };
      axiosDriver.abortRequest(abortSource);
      expect(abortSource.cancel).toBeCalledTimes(1);
    });
  });

  describe('sendRequest', () => {
    it('returns correct response', async () => {
      await expect(
        axiosDriver.sendRequest({ url: '/' }, { token: 'token' }),
      ).resolves.toEqual({ data: 'data' });
      expect(axiosInstance).toHaveBeenLastCalledWith({
        url: '/',
        cancelToken: 'token',
      });
    });
  });
});
