import { doc } from './test-utils.js';
import { createRuntime } from './helpers.js';

/** Basic CSS minification; removes some flakiness in testing CSS */
function cssMinify(css) {
  return css
    .trim() // remove whitespace
    .replace(/\n\s*/g, '') // collapse lines
    .replace(/\s*\{/g, '{') // collapse selectors
    .replace(/:\s*/g, ':') // collapse attributes
    .replace(/;}/g, '}'); // collapse block
}

let runtime;

describe('Styles SSR', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-styles-ssr');
  });

  test('Has <link> tags', async () => {
    const result = await runtime.load('/');
    const $ = doc(result.contents);

    for (const href of MUST_HAVE_LINK_TAGS) {
      expect($(`link[href="${href}"]`)).toHaveLength(1);
    }
  });

  test('Has correct CSS classes', async () => {
    // TODO: remove this (temporary CI patch)
    if (process.version.startsWith('v14.')) {
      return;
    }

    const result = await runtime.load('/');
    const $ = doc(result.contents);

    const MUST_HAVE_CLASSES = {
      '#react-css': 'react-title',
      '#react-modules': 'title', // ⚠️  this should be transformed
      '#vue-css': 'vue-title',
      '#vue-modules': 'title', // ⚠️  this should also be transformed
      '#vue-scoped': 'vue-title', // also has data-v-* property
      '#svelte-scoped': 'svelte-title', // also has additional class
    };

    for (const [selector, className] of Object.entries(MUST_HAVE_CLASSES)) {
      const el = $(selector);
      if (selector === '#react-modules' || selector === '#vue-modules') {
        // this will generate differently on Unix vs Windows. Here we simply test that it has transformed
        expect(el.attr('class')).toEqual(expect.stringMatching(new RegExp(`^_${className}_[A-Za-z0-9-_]+`))); // className should be transformed, surrounded by underscores and other stuff
      } else {
        // if this is not a CSS module, it should remain as expected
        expect(el.attr('class')).toEqual(expect.stringContaining(className));
      }

      // add’l test: Vue Scoped styles should have data-v-* attribute
      if (selector === '#vue-scoped') {
        const { attribs } = el.get(0);
        const scopeId = Object.keys(attribs).find((k) => k.startsWith('data-v-'));
        expect(scopeId).toBeTruthy();
      }

      // add’l test: Svelte should have another class
      if (selector === '#svelte-title') {
        expect(el.attr('class')).not.toBe(className);
      }
    }
  });

  test('CSS Module support in .astro', async () => {
    const result = await runtime.load('/');
    const $ = doc(result.contents);

    let scopedClass;

    // test 1: <style> tag in <head> is transformed
    const css = cssMinify(
      $('style')
        .html()
        .replace(/\.astro-[A-Za-z0-9-]+/, (match) => {
          scopedClass = match; // get class hash from result
          return match;
        })
    );

    expect(css).toBe(`.wrapper${scopedClass}{margin-left:auto;margin-right:auto;max-width:1200px}`);

    // test 2: element received .astro-XXXXXX class (this selector will succeed if transformed correctly)
    const wrapper = $(`.wrapper${scopedClass}`);
    expect(wrapper).toHaveLength(1);
  });

  test('Astro scoped styles', async () => {
    const result = await runtime.load('/');
    const $ = doc(result.contents);

    const el1 = $('#dynamic-class');
    const el2 = $('#dynamic-vis');

    let scopedClass;

    $('#class')
      .attr('class')
      .replace(/astro-[A-Za-z0-9-]+/, (match) => {
        scopedClass = match;
        return match;
      });

    if (!scopedClass) throw new Error(`Astro component missing scoped class`);

    expect(el1.attr('class')).toBe(`blue ${scopedClass}`);
    expect(el2.attr('class')).toBe(`visible ${scopedClass}`);
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
