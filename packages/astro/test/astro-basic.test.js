import { doc } from './test-utils.js';
import { createRuntime } from './helpers.js';

let runtime;

describe('Basic test', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-basic');
  });

  test('Can load page', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);

    expect($('h1').text()).toBe('Hello world!');
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
