import { createRuntime } from './helpers';

let runtime;
// note: Jest runs quicker if we manually specify routes. Add unique routes here
let pages = [
  '/',
  '/404',
  '/concepts/hot-module-replacement',
  '/guides',
  '/guides/tailwind-css',
  '/news',
  '/posts/2021-01-13-snowpack-3-0',
  '/plugins',
  '/reference/configuration',
  '/tutorials/react',
];

describe('snowpack.dev', () => {
  beforeAll(async () => {
    // load runtime
    runtime = await createRuntime('../../../examples/snowpack');
  });

  describe('Can load every page', () => {
    test.each(pages)(`%p`, async (pathname) => {
      const result = await runtime.load(pathname);
      expect(result.statusCode).toBe(200);
    });
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
