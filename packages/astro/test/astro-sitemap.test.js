import { createBuilder } from './helpers.js';

let builder;

describe('Sitemap Generation', () => {
  beforeAll(async () => {
    builder = await createBuilder('./fixtures/astro-rss');
    await builder.build();
  });

  test('Generates Sitemap correctly', async () => {
    let sitemap = await builder.readFile('/sitemap.xml');
    expect(sitemap).toMatchSnapshot();
  });
});
