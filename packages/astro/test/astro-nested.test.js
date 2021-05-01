import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { doc } from './test-utils.js';
import { setup, setupBuild } from './helpers.js';

const NestedComponents = suite('Nested components');

setup(NestedComponents, './fixtures/astro-nested');
setupBuild(NestedComponents, './fixtures/astro-nested');

NestedComponents('Allows static framework components inside of Astro components', async ({ runtime }) => {
  let result = await runtime.load('/static');

  assert.equal(result.statusCode, 200);
  const $ = doc(result.contents);

  const $react = $('#react');
  assert.equal($react.text().trim(), 'React');

  const $vue = $('#vue');
  assert.equal($vue.text().trim(), 'Vue');

  const $svelte = $('#svelte');
  assert.equal($svelte.text().trim(), 'Svelte');
});

NestedComponents('Allows load framework components inside of Astro components', async ({ runtime }) => {
  let result = await runtime.load('/load');

  assert.equal(result.statusCode, 200);
  const $ = doc(result.contents);

  const $react = $('#react');
  assert.equal($react.text().trim(), 'React');

  const $vue = $('#vue');
  assert.equal($vue.text().trim(), 'Vue');

  const $svelte = $('#svelte');
  assert.equal($svelte.text().trim(), 'Svelte');
});

NestedComponents('Allows idle framework components inside of Astro components', async ({ runtime }) => {
  let result = await runtime.load('/idle');

  assert.equal(result.statusCode, 200);
  const $ = doc(result.contents);

  const $react = $('#react');
  assert.equal($react.text().trim(), 'React');

  const $vue = $('#vue');
  assert.equal($vue.text().trim(), 'Vue');

  const $svelte = $('#svelte');
  assert.equal($svelte.text().trim(), 'Svelte');
});

NestedComponents('Allows visible framework components inside of Astro components', async ({ runtime }) => {
  let result = await runtime.load('/visible');

  assert.equal(result.statusCode, 200);
  const $ = doc(result.contents);

  const $react = $('#react');
  assert.equal($react.text().trim(), 'React');

  const $vue = $('#vue');
  assert.equal($vue.text().trim(), 'Vue');

  const $svelte = $('#svelte');
  assert.equal($svelte.text().trim(), 'Svelte');
});

NestedComponents('Can be built', async ({ build }) => {
  try {
    await build();
    assert.ok(true, 'Can build a project with component children');
  } catch (err) {
    console.log(err);
    assert.ok(false, 'build threw');
  }
});

NestedComponents.run();
