import { createRuntime } from './helpers';

let runtime;

describe('<!doctype>', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-doctype');
  });

  test('Automatically prepends the standards mode doctype', async () => {
    const result = await runtime.load('/prepend');
    if (result.error) throw new Error(result.error);

    const html = result.contents.toString('utf8');
    expect(html).toEqual(expect.stringMatching(new RegExp('^<!doctype html>')));
  });

  test.skip('Preserves user provided doctype', async () => {
    const result = await runtime.load('/preserve');
    if (result.error) throw new Error(result.error);

    const html = result.contents.toString('utf8');
    expect(html).toEqual(expect.stringMatching(new RegExp('^<!doctype HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">')));
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
