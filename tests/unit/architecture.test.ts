import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

function tsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return tsFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

it('nenhum arquivo em src/core importa phaser', () => {
  const offenders = tsFiles('src/core').filter((file) =>
    /from\s+['"]phaser['"]/.test(readFileSync(file, 'utf8')),
  );
  expect(offenders).toEqual([]);
});
