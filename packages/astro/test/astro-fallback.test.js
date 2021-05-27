import { doc } from './test-utils.js';
import { createRuntime } from './helpers.js';

let runtime;

describe('Dynamic component fallback', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-fallback');
  });

  test('Shows static content', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);
    expect($('#fallback').text()).toBe('static');
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
