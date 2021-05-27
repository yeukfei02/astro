import { doc } from './test-utils.js';
import { createBuilder, createRuntime } from './helpers.js';

let runtime;
let builder;

describe('Plain Markdown tests', () => {
  beforeAll(async () => {
    [runtime, builder] = await Promise.all([createRuntime('./fixtures/plain-markdown'), createBuilder('./fixtures/plain-markdown')]);
    await builder.build();
  });

  test('Can load a simple markdown page with Astro', async () => {
    const result = await runtime.load('/post');

    expect(result.statusCode).toBe(200);

    const $ = doc(result.contents);

    expect($('p').first().text()).toBe('Hello world!');
    expect($('#first').text()).toBe('Some content');
    expect($('#interesting-topic').text()).toBe('Interesting Topic');
  });

  test('Can load a realworld markdown page with Astro', async () => {
    const result = await runtime.load('/realworld');
    if (result.error) throw new Error(result.error);

    expect(result.statusCode).toBe(200);
    const $ = doc(result.contents);

    expect($('pre')).toHaveLength(7);
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
