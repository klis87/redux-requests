import { createDriver } from './promise-driver';

describe('promiseDriver', () => {
  it('returns a promise with correct response', async () => {
    const promise = Promise.resolve('data');
    const promiseDriver = createDriver();

    const responsePromise = promiseDriver(promise);

    await expect(responsePromise).resolves.toEqual({ data: 'data' });
  });
});
