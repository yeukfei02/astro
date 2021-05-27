import { format } from './test-utils.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const readFile = (path) => fs.readFile(fileURLToPath(new URL(`./fixtures/${path}`, import.meta.url)), 'utf8').then((res) => res.replace(/\r\n/g, '\n'));

describe('Prettier formatting', () => {
  test('can format a basic Astro file', async () => {
    const src = await readFile('basic.astro');
    expect(format(src)).toMatchSnapshot();
  });

  test('can format an Astro file with frontmatter', async () => {
    const src = await readFile('frontmatter.astro');
    expect(format(src)).toMatchSnapshot();
  });

  test('can format an Astro file with embedded JSX expressions', async () => {
    const src = await readFile('embedded-expr.astro');
    expect(format(src)).toMatchSnapshot();
  });
});
