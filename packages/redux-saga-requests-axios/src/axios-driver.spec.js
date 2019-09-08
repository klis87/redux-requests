import axios from 'axios';

import { createDriver } from './axios-driver';

jest.mock('axios');

describe('axiosDriver', () => {
  describe('requestInstance', () => {
    it('has correct value', () => {
      const axiosInstance = {};
      const axiosDriver = createDriver(axiosInstance);
      expect(axiosDriver.requestInstance).toBe(axiosInstance);
    });
  });

  describe('sendRequest', () => {
    it('returns cancellable promise with correct response', async () => {
      const axiosInstance = jest
        .fn()
        .mockResolvedValue({ data: 'data', status: 200 });
      const tokenSource = {
        token: 'token',
        cancel: jest.fn(),
      };
      const axiosDriver = createDriver(axiosInstance);
      axios.CancelToken.source.mockReturnValue(tokenSource);

      const responsePromise = axiosDriver.sendRequest(
        { url: '/' },
        { token: 'token' },
      );

      await expect(responsePromise).resolves.toEqual({ data: 'data' });
      expect(axiosInstance).toHaveBeenLastCalledWith({
        url: '/',
        cancelToken: 'token',
      });
      expect(tokenSource.cancel).not.toHaveBeenCalled();
      responsePromise.cancel();
      expect(tokenSource.cancel).toHaveBeenCalledTimes(1);
    });
  });
});
