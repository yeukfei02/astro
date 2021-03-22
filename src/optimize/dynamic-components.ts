import type { Optimizer } from '../@types/optimizer';
import type { Script, TemplateNode } from '../compiler/interfaces';

import path from 'path';
import eslexer from 'es-module-lexer';
import esbuild from 'esbuild';

const { transformSync } = esbuild;

function compileScriptSafe(raw: string): string {
  let compiledCode = compileExpressionSafe(raw);
  // esbuild treeshakes unused imports. In our case these are components, so let's keep them.
  const imports = eslexer
    .parse(raw)[0]
    .filter(({ d }) => d === -1)
    .map((i) => raw.substring(i.ss, i.se));
  for (let importStatement of imports) {
    if (!compiledCode.includes(importStatement)) {
      compiledCode = importStatement + '\n' + compiledCode;
    }
  }
  return compiledCode;
}

function compileExpressionSafe(raw: string): string {
  let { code } = transformSync(raw, {
    loader: 'tsx',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    charset: 'utf8',
  });
  return code;
}

export default function ({ filename, fileID }: { filename: string; fileID: string }): Optimizer {
  let rootElement: null | TemplateNode = null;
  let components: Record<string, { type: string; specifier: string; }> = {};

  return {
    visitors: {
      module: {
        enter(module: Script) {
          // Compile scripts as TypeScript, always
          const script = compileScriptSafe(module ? module.content : '');

          // Todo: Validate that `h` and `Fragment` aren't defined in the script
          const [scriptImports] = eslexer.parse(script, 'optional-sourcename');
          components = Object.fromEntries(
            scriptImports.map((imp) => {
              const componentType = path.posix.extname(imp.n!);
              const componentName = path.posix.basename(imp.n!, componentType);
              return [componentName, { type: componentType, specifier: imp.n! }];
            })
          );
        }
      },
      html: {
        Element: {
          enter(node) {
            if(!rootElement) {
              rootElement = node;
            }
          }
        },

        InlineComponent: {
          enter(node) {
            if(!node.name.endsWith(':dynamic')) {
              return;
            }

            // TODO what type of thing is this?
            const [componentName] = node.name.split(':') as [string, string];

            const componentImportData = components[componentName];
            if (!componentImportData) {
              throw new Error(`Unknown Component: ${componentName}`);
            }

            const url = new URL(componentImportData.specifier, `http://example.com/${fileID}`);
            const componentUrl = `/__hmx__${url.pathname.replace(/\.[^.]+$/, '.js')}`;

            node.type = 'Element';
            node.name = 'preact-island';
            node.children = [];
            node.attributes = [
              {
                type: 'Attribute',
                name: 'component',
                value: [{
                  type: 'Text',
                  data: componentUrl,
                  raw: componentUrl
                }]
              }
            ];
          }
        }
      }
    },
    async finalize() {
      if(rootElement) {
        rootElement.children?.push({
          start: 0, end: 0,
          type: 'Element',
          name: 'script',
          children: [],
          attributes: [{
            type: 'Attribute',
            name: 'type',
            value: [{
              type: 'Text',
              data: 'module',
              raw: 'module'
            }]
          }, {
            type: 'Attribute',
            name: 'src',
            value: [{
              type: 'Text',
              data: `/__hmx_internal__/islands/preact.js`,
              raw: `/__hmx_internal__/islands/preact.js`
            }]
          }]
        });
      }
    }
  }
}