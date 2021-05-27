import { fileURLToPath } from 'url';
import { createDevServer } from './helpers.js';
import { loadConfig } from '../dist/config.js';

describe('Config path', () => {
  const root = new URL('./fixtures/config-port/', import.meta.url);

  test('can be specified in the astro config', async () => {
    const astroConfig = await loadConfig(fileURLToPath(root));
    expect(astroConfig.devOptions.port).toBe(3001);
  });

  test('can be specified via --port flag', async () => {
    const args = ['--port', '3002'];
    const proc = createDevServer(root, args);

    proc.stdout.setEncoding('utf8');
    for await (const chunk of proc.stdout) {
      if (/Local:/.test(chunk)) {
        // Using the right port
        expect(/:3002/.test(chunk)).toBeTruthy();
        break;
      }
    }

    proc.kill();

    // test will fail if not completed within time
  });
});
