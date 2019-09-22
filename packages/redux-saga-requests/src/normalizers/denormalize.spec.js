import { denormalize } from './denormalize';

describe('denormalize', () => {
  it('should not affect objects without any reference', () => {
    expect(denormalize({ key: 'value' }, {})).toEqual({ key: 'value' });
    expect(denormalize('', {})).toEqual('');
    expect(denormalize('x', {})).toEqual('x');
    expect(denormalize(null, {})).toEqual(null);
  });

  it('should handle reference in direct string', () => {
    expect(denormalize('@@1', { '@@1': { id: '1', a: 'b' } })).toEqual({
      id: '1',
      a: 'b',
    });
  });

  it('should handle single reference in object', () => {
    expect(
      denormalize({ key: 'value', ref: '@@1' }, { '@@1': { id: '1', a: 'b' } }),
    ).toEqual({ key: 'value', ref: { id: '1', a: 'b' } });
  });

  it('should handle multiple references', () => {
    expect(
      denormalize(
        { key: 'value', ref: '@@1', nested: { k: 'v', anotherRef: '@@2' } },
        { '@@1': { id: '1', a: 'b' }, '@@2': { id: '2', c: 'd' } },
      ),
    ).toEqual({
      key: 'value',
      ref: { id: '1', a: 'b' },
      nested: { k: 'v', anotherRef: { id: '2', c: 'd' } },
    });
  });

  it('should handle reference nested in another references', () => {
    expect(
      denormalize(
        { key: 'value', ref: '@@1' },
        { '@@1': { id: '1', nested: '@@2' }, '@@2': { id: '2', c: 'd' } },
      ),
    ).toEqual({
      key: 'value',
      ref: { id: '1', nested: { id: '2', c: 'd' } },
    });
  });

  it('should handle arrays', () => {
    expect(
      denormalize([{ key: 'value', ref: '@@1' }, 'x', '@@2'], {
        '@@1': { id: '1', nested: '@@2' },
        '@@2': { id: '2', c: 'd' },
      }),
    ).toEqual([
      { key: 'value', ref: { id: '1', nested: { id: '2', c: 'd' } } },
      'x',
      { id: '2', c: 'd' },
    ]);
  });
});
