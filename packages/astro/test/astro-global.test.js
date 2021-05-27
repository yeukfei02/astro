import { doc } from './test-utils.js';
import { createRuntime } from './helpers.js';

let runtime;

describe('Astro.*', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-global');
  });

  test('Astro.request.url', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);
    expect($('#pathname').text()).toBe('/');
  });

  const canonicalURLs = {
    '/': 'https://mysite.dev/',
    '/post/post': 'https://mysite.dev/post/post/',
    '/posts': 'https://mysite.dev/posts/',
    '/posts/1': 'https://mysite.dev/posts/', // should be the same as /posts
    '/posts/2': 'https://mysite.dev/posts/2/',
  };

  // given a URL, expect the following canonical URL
  test.each(Object.entries(canonicalURLs))(`Astro.request.canonicalURL: %p`, async (url, canonicalURL) => {
    const result = await runtime.load(url);
    const $ = doc(result.contents);
    expect($('link[rel="canonical"]').attr('href')).toBe(canonicalURL);
  });

  test('Astro.site', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);
    expect($('#site').attr('href')).toBe('https://mysite.dev');
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
