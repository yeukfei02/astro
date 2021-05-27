import { createBuilder } from './helpers.js';

let builder;

describe('RSS Generation', () => {
  beforeAll(async () => {
    builder = await createBuilder('./fixtures/astro-rss');
    await builder.build();
  });

  test('Generates RSS correctly', async () => {
    let rss = await builder.readFile('/feed/episodes.xml');
    expect(rss).toMatchSnapshot();
  });
});
