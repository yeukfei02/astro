import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { setup, setupBuild } from './helpers.js';
import { doc } from './test-utils.js';

const Markdown = suite('Astro Markdown Plugin tests');

setup(Markdown, './fixtures/astro-markdown-plugin');
setupBuild(Markdown, './fixtures/astro-markdown-plugin');


Markdown('Can load markdown plugins within a <Markdown> component', async ({ runtime }) => {
  const result = await runtime.load('/astro');

  assert.equal(result.statusCode, 200);

  const $ = doc(result.contents);
  assert.equal($('h1').text(), 'Hello world!');
  console.log($('.container').text());
});

Markdown('Can load markdown plugins within a plain markdown file', async ({ runtime }) => {
  const result = await runtime.load('/markdown');

  assert.equal(result.statusCode, 200);

  const $ = doc(result.contents);
  console.log($('.container').text());
});

Markdown('Builds', async ({ build }) => {
  try {
    await build();
    assert.ok(true, 'Can build the project');
  } catch (err) {
    console.log(err);
    assert.ok(false, 'build threw');
  }
});

Markdown.run();
