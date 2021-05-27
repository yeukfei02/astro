import { createBuilder, createRuntime } from './helpers.js';

let runtime;
let builder;

describe('Dynamic components tests', () => {
  beforeAll(async () => {
    [runtime, builder] = await Promise.all([createRuntime('./fixtures/astro-dynamic'), createBuilder('./fixtures/astro-dynamic')]);
  });

  test('Loads client-only packages', async () => {
    let result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    // Grab the react-dom import
    const exp = /import\("(.+?)"\)/g;
    let match, reactRenderer;
    while ((match = exp.exec(result.contents))) {
      if (match[1].includes('renderers/react/client.js')) {
        reactRenderer = match[1];
      }
    }

    // test 1: React renderer is on the page
    expect(reactRenderer).toBeTruthy();

    result = await runtime.load(reactRenderer);
    // test 2: Can load react renderer
    expect(result.statusCode).toBe(200);
  });

  test('Can be built', async () => {
    await builder.build();
    expect(true).toBeTruthy();
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
