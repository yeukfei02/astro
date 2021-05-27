import { doc } from './test-utils.js';
import { createBuilder, createRuntime } from './helpers.js';

let runtime;
let builder;

// TODO: reenable test
describe.skip('Component children tests', () => {
  beforeAll(async () => {
    [runtime, builder] = await Promise.all([createRuntime('./fixtures/astro-children'), createBuilder('./fixtures/astro-children')]);
  });

  describe('Passes string children to framework components', () => {
    let $;

    beforeAll(async () => {
      const result = await runtime.load('/strings');
      console.log(JSON.stringify(result, null, 2));
      if (result.error) throw new Error(result);
      $ = doc(result.contents);
    });

    test('Can pass text to Preact components', () => {
      const $preact = $('#preact');
      expect($preact.text().trim()).toBe('Hello world');
    });

    test('Can pass text to Vue components', () => {
      const $vue = $('#vue');
      expect($vue.text().trim()).toBe('Hello world');
    });

    test('Can pass text to Svelte components', () => {
      const $svelte = $('#svelte');
      expect($svelte.text().trim()).toBe('Hello world');
    });
  });

  describe('Passes markup children to framework components', () => {
    let $;

    beforeAll(async () => {
      const result = await runtime.load('/markup');
      if (result.error) throw new Error(result.error);
      $ = doc(result.contents);
    });

    test('Can pass markup to Preact components', () => {
      const $preact = $('#preact h1');
      expect($preact.text().trim()).toBe('Hello world');
    });

    test('Can pass markup to Vue components', () => {
      const $vue = $('#vue h1');
      expect($vue.text().trim()).toBe('Hello world');
    });

    test('Can pass markup to Svelte components', () => {
      const $svelte = $('#svelte h1');
      expect($svelte.text().trim()).toBe('Hello world');
    });
  });

  describe('Passes multiple children to framework components', () => {
    let $;

    beforeAll(async () => {
      let result = await runtime.load('/multiple');
      if (result.error) {
        console.log(result);
        throw new Error(result.error);
      }
      $ = doc(result.contents);
    });

    test('Can pass multiple children to Preact components', () => {
      const $preact = $('#preact');
      expect($preact.children()).toHaveLength(2);
      expect($preact.children(':first-child').text().trim()).toBe('Hello world');
      expect($preact.children(':last-child').text().trim()).toBe('Goodbye world');
    });

    test('Can pass multiple children to Vue components', () => {
      const $vue = $('#vue');
      expect($vue.children().length).toHaveLength(2);
      expect($vue.children(':first-child').text().trim()).toBe('Hello world');
      expect($vue.children(':last-child').text().trim()).toBe('Goodbye world');
    });

    test('Can pass multiple children to Svelte components', () => {
      const $svelte = $('#svelte');
      expect($svelte.children().length).toHaveLength(2);
      expect($svelte.children(':first-child').text().trim()).toBe('Hello world');
      expect($svelte.children(':last-child').text().trim()).toBe('Goodbye world');
    });
  });

  test('Can be built', async () => {
    await builder.build();
    expect(true).toBeTruthy();
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
