import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import execa from 'execa';
import { build as astroBuild } from '../dist/build.js';
import { loadConfig } from '../dist/config.js';
import { createRuntime as createAstroRuntime } from '../dist/runtime.js';

/** setup fixtures for tests */
export async function createRuntime(fixturePath) {
  const astroConfig = await loadConfig(fileURLToPath(new URL(fixturePath, import.meta.url)));
  return await createAstroRuntime(astroConfig, {
    logging: {
      level: 'error',
      dest: process.stderr,
    },
  });
}

export async function createBuilder(fixturePath) {
  const astroConfig = await loadConfig(fileURLToPath(new URL(fixturePath, import.meta.url)));

  let context = {};
  context.build = () =>
    astroBuild(astroConfig, {
      level: 'error',
      dest: process.stderr,
    });
  context.readFile = (path) => {
    const resolved = fileURLToPath(new URL(`${fixturePath}/${astroConfig.dist}${path}`, import.meta.url));
    return readFile(resolved).then((r) => r.toString('utf8'));
  };

  return context;
}

const cliURL = new URL('../astro.mjs', import.meta.url);
export function createDevServer(root, additionalArgs = []) {
  const args = [cliURL.pathname, 'dev', '--project-root', root.pathname].concat(additionalArgs);
  const proc = execa('node', args);
  return proc;
}
