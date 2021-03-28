import parse, { renderToString } from './src/index.mjs';
import fs from 'fs/promises';
import prettier from 'prettier';

async function test() {
    const text = (await fs.readFile('./examples/index.astro')).toString();
    try {
        await fs.mkdir('./dist');
    } catch (e) {}

    let result = renderToString(parse(text));
    result = prettier.format(result, { parser: 'html' });
    await fs.writeFile('./dist/index.html', result);
}

test();
