import toAst, { renderToString } from './src/index.mjs';
import fs from 'fs/promises';
import prettier from 'prettier';

async function test() {
    const text = (await fs.readFile('./examples/index.astro')).toString();
    try {
        await fs.mkdir('./dist');
    } catch (e) {}

    let ast = toAst(text);
    let rendered = renderToString(ast);

    rendered = prettier.format(rendered, { parser: 'html' });
    await fs.writeFile('./dist/index.json', JSON.stringify(ast, null, 2));
    await fs.writeFile('./dist/index.html', rendered);
}

test();
