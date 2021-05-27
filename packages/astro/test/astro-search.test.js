import { createRuntime } from './helpers.js';

let runtime;

describe('Search paths', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-basic');
  });

  test('Finds the root page', async () => {
    const result = await runtime.load('/');
    expect(result.statusCode).toBe(200);
  });

  test('Matches pathname to filename', async () => {
    const result = await runtime.load('/news');
    expect(result.statusCode).toBe(200);
  });

  test('A URL with a trailing slash can match a folder with an index.astro', async () => {
    const result = await runtime.load('/nested-astro/');
    expect(result.statusCode).toBe(200);
  });

  test('A URL with a trailing slash can match a folder with an index.md', async () => {
    const result = await runtime.load('/nested-md/');
    expect(result.statusCode).toBe(200);
  });

  test('A URL without a trailing slash can redirect to a folder with an index.astro', async () => {
    const result = await runtime.load('/nested-astro');
    expect(result.statusCode).toBe(301);
    expect(result.location).toBe('/nested-astro/');
  });

  test('A URL without a trailing slash can redirect to a folder with an index.md', async () => {
    const result = await runtime.load('/nested-md');
    expect(result.statusCode).toBe(301);
    expect(result.location).toBe('/nested-md/');
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
