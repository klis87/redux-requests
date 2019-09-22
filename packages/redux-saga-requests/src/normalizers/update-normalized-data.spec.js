import { updateNormalizedData } from './update-normalized-data';

describe('updateNormalizedData', () => {
  it('doesnt change normalized data when no id in mutation data', () => {
    expect(updateNormalizedData({ k: 'v' }, { '@@1': { id: 1 } })).toEqual({
      '@@1': { id: 1 },
    });
  });

  it('change normalized data when id is matched', () => {
    expect(
      updateNormalizedData({ k: 'v', id: 1 }, { '@@1': { id: 1 } }),
    ).toEqual({
      '@@1': { id: 1, k: 'v' },
    });
  });

  it('change normalized data when id is not matched', () => {
    expect(
      updateNormalizedData({ k: 'v2', id: 2 }, { '@@1': { id: 1, k: 'v' } }),
    ).toEqual({
      '@@1': { id: 1, k: 'v' },
      '@@2': { id: 2, k: 'v2' },
    });
  });

  it('correctly updates normalized data no matter what mutation data structure is', () => {
    expect(
      updateNormalizedData(
        [
          { k: 'v', id: 1 },
          {
            nested: {
              k: 'v2',
              id: 2,
            },
          },
        ],
        { '@@1': { id: 1 } },
      ),
    ).toEqual({
      '@@1': { id: 1, k: 'v' },
      '@@2': { id: 2, k: 'v2' },
    });
  });

  it('can handle mutation data with id nested in id and update reference', () => {
    expect(
      updateNormalizedData(
        { id: 1, k: 'v1', ref: { id: 3, k: 'v3' } },
        { '@@1': { id: 1, k: 'v', ref: '@@2' }, '@@2': { id: 2, k: 'v2' } },
      ),
    ).toEqual({
      '@@1': { id: 1, k: 'v1', ref: '@@3' },
      '@@2': { id: 2, k: 'v2' },
      '@@3': { id: 3, k: 'v3' },
    });
  });

  it('deeply merges nested objects', () => {
    expect(
      updateNormalizedData(
        {
          id: 1,
          nested: {
            k2: 'v2',
            deeplyNested: {
              x: 4,
              z: 3,
            },
          },
        },
        {
          '@@1': {
            id: 1,
            a: '1',
            nested: {
              k: 'v',
              deeplyNested: {
                x: 1,
                y: 2,
              },
            },
          },
        },
      ),
    ).toEqual({
      '@@1': {
        id: 1,
        a: '1',
        nested: {
          k: 'v',
          k2: 'v2',
          deeplyNested: {
            x: 4,
            y: 2,
            z: 3,
          },
        },
      },
    });
  });

  it('overrides not merges arrays', () => {
    expect(
      updateNormalizedData(
        {
          id: 1,
          nested: {
            deeplyNested: [{ id: 3, x: 33 }, { id: 4, x: 4 }],
          },
        },
        {
          '@@1': {
            id: 1,
            nested: {
              deeplyNested: ['@@2', '@@3'],
            },
          },
          '@@2': { id: 2, x: 2 },
          '@@3': { id: 3, x: 3 },
        },
      ),
    ).toEqual({
      '@@1': {
        id: 1,
        nested: {
          deeplyNested: ['@@3', '@@4'],
        },
      },
      '@@2': { id: 2, x: 2 },
      '@@3': { id: 3, x: 33 },
      '@@4': { id: 4, x: 4 },
    });
  });
});
