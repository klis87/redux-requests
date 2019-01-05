import axios from 'axios';

import { createDriver } from './graphql-driver';
import { gql } from './gql';

jest.mock('axios');

describe('graphqlDriver', () => {
  const graphqlDriver = createDriver({ url: '/graphql' });

  describe('requestInstance', () => {
    it('has correct value', () => {
      axios.create.mockReturnValueOnce('axiosInstance');
      const driver = createDriver({ url: 'http://graphql' });
      expect(driver.requestInstance).toBe('axiosInstance');
      expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://graphql' });
    });
  });

  describe('getAbortSource', () => {
    it('returns new source', () => {
      const tokenSource = {
        token: 'token',
        cancel: () => 'cancelled',
      };

      axios.CancelToken.source.mockReturnValue(tokenSource);
      expect(graphqlDriver.getAbortSource()).toBe(tokenSource);
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { cancel: jest.fn() };
      graphqlDriver.abortRequest(abortSource);
      expect(abortSource.cancel).toBeCalledTimes(1);
    });
  });

  describe('sendRequest', () => {
    const axiosInstanceMock = jest.fn();
    axios.create.mockReturnValueOnce(axiosInstanceMock);
    const driver = createDriver({ url: '/graphql' });

    it('returns correct response', async () => {
      axiosInstanceMock.mockResolvedValueOnce({
        data: 'data',
      });
      axiosInstanceMock.mockClear();
      const query = gql`
        {
          x
        }
      `;
      await expect(
        driver.sendRequest({ query }, { token: 'token' }),
      ).resolves.toEqual({
        data: 'data',
      });
      await expect(axiosInstanceMock).toBeCalledWith({
        cancelToken: 'token',
        method: 'post',
        data: {
          query,
        },
      });
    });

    it('rejects response if errors present in response.data', async () => {
      axiosInstanceMock.mockResolvedValueOnce({
        data: { errors: 'errors' },
      });
      axiosInstanceMock.mockClear();

      await expect(
        driver.sendRequest(
          {
            query: gql`
              {
                x
              }
            `,
          },
          { token: 'token' },
        ),
      ).rejects.toEqual({
        data: { errors: 'errors' },
      });
    });

    it('rejects response when server error', async () => {
      axiosInstanceMock.mockRejectedValueOnce('error');
      axiosInstanceMock.mockClear();

      await expect(
        driver.sendRequest(
          {
            query: gql`
              {
                x
              }
            `,
          },
          { token: 'token' },
        ),
      ).rejects.toBe('error');
    });

    it('sends request as form data when uploading files', async () => {
      axiosInstanceMock.mockResolvedValueOnce({
        data: 'data',
      });
      axiosInstanceMock.mockClear();
      const file = new File(['1'], '1.txt', { type: 'text/plain' });
      const query = gql`
        mutation($file: Upload!, $x: Int!) {
          singleUpload(file: $file, x: $x) {
            filename
            mimetype
          }
        }
      `;
      const data = new FormData();
      data.append(
        'operations',
        JSON.stringify({
          query,
          variables: { file: null, x: 1 },
        }),
      );
      data.append('map', JSON.stringify({ 0: ['variables.file'] }));
      data.append(0, file, '1.txt');

      await driver.sendRequest(
        {
          query,
          variables: { file, x: 1 },
        },
        { token: 'token' },
      );
      await expect(axiosInstanceMock).toBeCalledWith({
        cancelToken: 'token',
        method: 'post',
        data,
      });
    });
  });

  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: { data: 'data' } };
      expect(graphqlDriver.getSuccessPayload(response)).toEqual(
        response.data.data,
      );
    });

    it('returns array of response data', () => {
      const responses = [
        { data: { data: 'data1' } },
        { data: { data: 'data2' } },
      ];
      expect(graphqlDriver.getSuccessPayload(responses)).toEqual([
        responses[0].data.data,
        responses[1].data.data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      expect(graphqlDriver.getErrorPayload(error)).toBe(error);
    });
  });
});
