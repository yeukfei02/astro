import * as path from 'path';
// @ts-ignore
import * as glob from 'tiny-glob/sync';
import * as slash from 'slash';

/**
 * Handling for import.meta.glob and import.meta.globEager
 */
interface GlobOptions {
  glob: string; 
  url: string;
  filename: string;
}

/** General glob handling */
function globSearch(spec: string, { filename }: { filename: string }): string[] {
  const cwd = path.dirname(filename);
  let found = glob(spec, { cwd, filesOnly: true });
  console.log({found});
  if (!found.length) {
    throw new Error(`No files matched "${spec}" from ${filename}`);
  }
  return found
  // @ts-ignore
    .map((f) => slash(f[0] === '.' ? f : `./${f}`)
    .replace(/\.md$/, '.js'));
}

/** Astro.fetchContent() */
export async function fetchContent({glob, url, filename}: GlobOptions): Promise<any[]> {
  console.log({glob, filename});
  let code = '';
  const imports = new Set<string>();
  const importPaths = globSearch(glob, { filename });
  return importPaths;
}
