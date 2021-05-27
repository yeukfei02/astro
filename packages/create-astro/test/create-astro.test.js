import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import execa from 'execa';
import del from 'del';

describe.skip('npm init astro', () => {
  beforeAll(async () => {
    await del(cwd);
    await fs.promises.mkdir(cwd);
  });

  const cwd = fileURLToPath(new URL('./fixtures/', import.meta.url));

  const templates = ['blank', 'starter'];

  for (const template of templates) {
    it(template, async (done) => {
      const { stdout } = await execa('../../create-astro.js', [`./${template}`, '--template', template, '--skip-install'], { cwd });

      // test: path should formatted as './{dirName}'
      expect(stdout).not.toEqual(expect.stringContaining('././'));

      const DOES_HAVE = ['.gitignore', 'package.json', 'public', 'src'];
      const DOES_NOT_HAVE = ['_gitignore', 'meta.json', 'node_modules'];

      // test: template contains essential files & folders
      for (const file of DOES_HAVE) {
        expect(fs.existsSync(path.join(cwd, template, file))).toBeTruthy();
      }

      // test: template DOES NOT contain files supposed to be stripped away
      for (const file of DOES_NOT_HAVE) {
        expect(fs.existsSync(path.join(cwd, template, file))).not.toBeTruthy();
      }

      done();
    });
  }
});
