import { getDependentKeys } from './get-dependent-keys';

describe('getDependentKeys', () => {
  it('should return empty set when no dependencies', () => {
    expect(getDependentKeys({ data: 'data' }, {}, {})).toEqual(new Set());
  });

  it('should get single dependent key', () => {
    expect(
      getDependentKeys('@@1', { '@@1': { id: 1 } }, { '': ['id'] }),
    ).toEqual(new Set(['@@1']));
  });

  it('should get nested dependent key', () => {
    expect(
      getDependentKeys(
        '@@1',
        { '@@1': { id: 1, nested: '@@2' }, '@@2': { id: 2, x: 1 } },
        { '': ['id', 'nested'], '.nested': ['id', 'x'] },
      ),
    ).toEqual(new Set(['@@1', '@@2']));
  });

  it('should not get nested key if not dependent on', () => {
    expect(
      getDependentKeys(
        '@@1',
        { '@@1': { id: 1, nested: '@@2' }, '@@2': { id: 2, x: 1 } },
        { '': ['id'] },
      ),
    ).toEqual(new Set(['@@1']));
  });

  it('should get dependent keys from array', () => {
    expect(
      getDependentKeys(
        ['@@1', '@@2'],
        { '@@1': { id: 1 }, '@@2': { id: 2 } },
        { '': ['id'] },
      ),
    ).toEqual(new Set(['@@1', '@@2']));
  });
});
