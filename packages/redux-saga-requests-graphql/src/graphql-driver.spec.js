import axios from 'axios';

import { createDriver } from './graphql-driver';
import { gql } from './gql';

jest.mock('axios');

describe('graphqlDriver', () => {
  const axiosInstanceMock = jest.fn();
  axios.create.mockReturnValueOnce(axiosInstanceMock);
  const tokenSource = {
    token: 'token',
    cancel: () => jest.fn(),
  };
  axios.CancelToken.source.mockReturnValue(tokenSource);
  const driver = createDriver({ url: '/graphql' });

  it('returns correct response', async () => {
    axiosInstanceMock.mockClear();
    axiosInstanceMock.mockResolvedValueOnce({
      data: 'data',
    });
    const query = gql`
      {
        x
      }
    `;
    await expect(
      driver({ query, headers: { header: 'header' } }, { token: 'token' }),
    ).resolves.toEqual({
      data: 'data',
    });
    await expect(axiosInstanceMock).toBeCalledWith({
      cancelToken: 'token',
      method: 'post',
      headers: {
        header: 'header',
      },
      data: {
        query,
      },
    });
  });

  it('rejects response if errors present in response.data', async () => {
    axiosInstanceMock.mockClear();
    axiosInstanceMock.mockResolvedValueOnce({
      data: { errors: 'errors' },
    });

    await expect(
      driver(
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
    axiosInstanceMock.mockClear();
    axiosInstanceMock.mockRejectedValueOnce('error');

    await expect(
      driver(
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
    axiosInstanceMock.mockClear();
    axiosInstanceMock.mockResolvedValueOnce({
      data: 'data',
    });
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

    await driver(
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
