import { doc } from './test-utils.js';
import { createBuilder, createRuntime } from './helpers.js';

let runtime;
let builder;

describe('Astro Markdown tests', () => {
  beforeAll(async () => {
    [runtime, builder] = await Promise.all([createRuntime('./fixtures/astro-markdown'), createBuilder('./fixtures/astro-markdown')]);
    await builder.build();
  });

  test('Can load markdown pages with Astro', async () => {
    const result = await runtime.load('/post');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);

    // test 1: There is a div added in markdown
    expect($('#first').length).toBeTruthy();

    // test 2: There is a div added via a component from markdown
    expect($('#test').length).toBeTruthy();
  });

  test('Can load more complex jsxy stuff', async () => {
    const result = await runtime.load('/complex');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);
    const $el = $('#test');
    expect($el.text()).toBe('Hello world');
  });

  test('Bundles client-side JS for prod', async () => {
    // test 1: Counter.js is injected in HTML
    const complexHtml = await builder.readFile('/complex/index.html');
    expect(complexHtml).toEqual(expect.stringContaining(`import("/_astro/components/Counter.js"`));

    // test 2: Counter.jsx is built
    const counterJs = await builder.readFile('/_astro/components/Counter.js');
    expect(counterJs).toBeTruthy();
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
