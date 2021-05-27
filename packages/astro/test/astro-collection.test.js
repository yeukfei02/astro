import { doc } from './test-utils.js';
import { createRuntime } from './helpers.js';

let runtime;

describe('Collections', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-collection');
  });

  test('shallow selector (*.md)', async () => {
    const result = await runtime.load('/shallow');
    if (result.error) throw new Error(result.error);
    const $ = doc(result.contents);
    const urls = [
      ...$('#posts a').map(function () {
        return $(this).attr('href');
      }),
    ];
    // assert they loaded in newest -> oldest order (not alphabetical)
    expect(urls).toEqual(['/post/three', '/post/two', '/post/one']);
  });

  test('deep selector (**/*.md)', async () => {
    const result = await runtime.load('/nested');
    if (result.error) throw new Error(result.error);
    const $ = doc(result.contents);
    const urls = [
      ...$('#posts a').map(function () {
        return $(this).attr('href');
      }),
    ];
    expect(urls).toEqual(['/post/nested/a', '/post/three', '/post/two', '/post/one']);
  });

  test('generates pagination successfully', async () => {
    const result = await runtime.load('/paginated');
    if (result.error) throw new Error(result.error);
    const $ = doc(result.contents);
    const prev = $('#prev-page');
    const next = $('#next-page');
    expect(prev).toHaveLength(0); // this is first page; should be missing
    expect(next).toHaveLength(1); // this should be on-page
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
