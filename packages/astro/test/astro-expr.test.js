import { doc } from './test-utils.js';
import { createRuntime } from './helpers.js';

let runtime;

describe('Expressions', () => {
  beforeAll(async () => {
    runtime = await createRuntime('./fixtures/astro-expr');
  });

  test('Can load page', async () => {
    const result = await runtime.load('/');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);

    for (let col of ['red', 'yellow', 'blue']) {
      expect($('#' + col)).toHaveLength(1);
    }
  });

  test('Ignores characters inside of strings', async () => {
    const result = await runtime.load('/strings');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);

    for (let col of ['red', 'yellow', 'blue']) {
      expect($('#' + col)).toHaveLength(1);
    }
  });

  test('Ignores characters inside of line comments', async () => {
    const result = await runtime.load('/line-comments');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);

    for (let col of ['red', 'yellow', 'blue']) {
      expect($('#' + col)).toHaveLength(1);
    }
  });

  test('Ignores characters inside of multiline comments', async () => {
    const result = await runtime.load('/multiline-comments');
    if (result.error) throw new Error(result.error);

    const $ = doc(result.contents);

    for (let col of ['red', 'yellow', 'blue']) {
      expect($('#' + col)).toHaveLength(1);
    }
  });

  test('Allows multiple JSX children in mustache', async () => {
    const result = await runtime.load('/multiple-children');
    if (result.error) throw new Error(result.error);

    expect(result.contents).toEqual(expect.stringContaining('#f'));
    expect(result.contents).not.toEqual(expect.stringContaining('#t'));
  });

  afterAll(async () => {
    await runtime.shutdown();
  });
});
