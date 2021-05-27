import { doc } from './test-utils.js';
import { createRuntime } from './helpers';

let runtime;

describe('React Components', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/react-component');
  });

  test('Can load React', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);
    expect($('#react-h2').text()).toBe('Hello world!');
  });

  test('Can load Vue', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);
    expect($('#vue-h2').text()).toBe('Hasta la vista, baby');
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
