import * as tt from 'typescript-definition-tester';
import path from 'path';

describe('TypeScript definitions', () => {
  it('should compile against index.d.ts', (done) => {
    tt.compile(
      [path.join(__dirname, 'typescript.types.ts')],
      {},
      () => done(),
    );
  });
});
