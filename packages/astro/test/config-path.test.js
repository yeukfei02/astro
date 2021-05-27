import { createDevServer } from './helpers.js';

const root = new URL('./fixtures/config-path/', import.meta.url);

describe('Config path', () => {
  test('can be passed via --config', async () => {
    const configPath = new URL('./config/my-config.mjs', root).pathname;
    const args = ['--config', configPath];
    const proc = createDevServer(root, args);

    proc.stdout.setEncoding('utf8');

    for await (const chunk of proc.stdout) {
      if (/Server started/.test(chunk)) {
        break;
      }
    }

    proc.kill();

    // test will fail if not completed within time
  });
});
