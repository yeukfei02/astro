import htm from 'htm';
import esbuild from 'esbuild';
import sanitize from './sanitize.mjs';

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;

const parse = (text) => {
  let ignoreBrace = false;
  let buffer = '';

  let braceCount = -1;
  let fieldsPos = [];
  let frontmatterState = -1;
  let frontmatter = '';

  // Statics are all the markup before and after an interpolated { ... } section
  let statics = [];

  // Interpolations are the contents of an interpolated { ... } section
  let interpolations = [];

  // Having `statics` and `interpolations` matches the signature of a tagged template literal
  // htm`<div>${content}</div>` => htm(['<div>', '</div>'], [content])

  for (let i = 0; i < text.length - 1; i++) {
    let ch = text[i];
    if (frontmatterState < 1 && ch === '-' && text[i + 1] === '-' && text[i + 2] === '-') {
      frontmatterState++;
      i += 2;
      continue;
    }
    if (frontmatterState === 0) {
      frontmatter += ch;
      continue;
    }

    ignoreBrace = ignoreBrace || buffer.endsWith('<script') || buffer.endsWith('<style') || buffer.endsWith('<!--');
    // Ignore "{" "}" inside of comments or <script> or <style> tags
    if (ignoreBrace) {
      if (ch === '/' && (text[i + 1] === '>' || text[i + 1] === 's')) ignoreBrace = false;
      if (ch === '>' && buffer.endsWith('--')) ignoreBrace = false;
      buffer += ch;
    } else {
      if (ch === '{') {
        // braceCount > 0 means we're seeing "{" inside an interpolated section
        braceCount++;
        // braceCount === 0 means we're entering an interpolated section
        if (braceCount === 0) {
          fieldsPos[0] = i + 1;
          statics.push(buffer);
          buffer = '';
        }
      } else if (ch === '}') {
        // braceCount === 0 means we're closing out an interpolated section
        if (braceCount === 0) {
          fieldsPos[1] = i;
          interpolations.push(text.slice(...fieldsPos));
          fieldsPos = [];
        }
        // braceCount > 0 means we're seeing "}" inside an interpolated section
        braceCount--;
      } else if (braceCount < 0) {
        // track the file contents outside of an interpolated section in a temporary buffer
        buffer += ch;
      }
    }

    // End of file, push `buffer` to `statics`
    if (i === text.length - 2) {
      statics.push(buffer);
    }
  }

  // compile the frontmatter once
  let builtFrontmatter = null;

  // Let's evaluate the interpolated expression with the frontmatter setting up our context
  const evalInterpolation = (i, props = {}) => {
    if (!builtFrontmatter) {
      const { code } = esbuild.transformSync(frontmatter, {
        loader: 'tsx',
        jsxFactory: '$astro_h',
        jsxFragment: 'Fragment',
        format: 'esm',
      });
      builtFrontmatter = code;
    }
    if (i === 'Fragment') return '';

    const { code } = esbuild.transformSync(`(function() { return ${i} })()`, {
      loader: 'tsx',
      // custom `jsxFactory` will return our JSON AST for processing
      jsxFactory: '$astro_h',
      // expose `Fragment` as a global
      jsxFragment: 'Fragment',
      format: 'esm',
    });
    const value = new Function(`
        const $astro_h = (type, props, ...children) => ({ type, props, children });
        const Fragment = '';
        ${builtFrontmatter};
        return ${code}
      `)(props);
    return value;
  };

  // Custom `h` function to return an AST from `htm`
  const $astro_h = (type, props, ...children) => {
    // case-sensitive tags => starting with a capital letter means it's a component
    if (/^[A-Z]/.test(type)) {
      return { type: evalInterpolation(type, { ...props, children }), props, children };
    }
    return { type, props, children };
  };

  // `htm` does pretty much all the heavy lifting here
  return htm.bind($astro_h).apply(null, [statics, ...interpolations.map((i) => evalInterpolation(i))]);
};

const isNullish = (value) => (value === false || value === null || value === undefined);
const isFalsey = (value) => !value;

export const evaluate = (built) => {
  const evaluateAST = (built, ctx = {}) => {
    if (Array.isArray(built)) {
      return built.map((vnode) => {
        if (typeof vnode === 'function') return evaluateAST(vnode()).flat(Infinity);

        if (Array.isArray(vnode)) return evaluateAST(vnode).flat(Infinity);
        
        // This should be a { type, props, children } node
        // TODO: handle objects that aren't
        if (typeof vnode === 'object') {
          let props, innerHTML, children;

          if (vnode.props) ({ dangerouslySetInnerHTML: innerHTML, children, ...props } = vnode.props);
          if (innerHTML) {
            children = innerHTML.__html;
            if (typeof children === 'string') {
              // If children looks like an HTML string, let's recursively flatten it to an AST
              // so we can apply optimizations to this subtree if necessary
              children = (children.indexOf('<') > -1) ? evaluate(parse(children)) : children;
            }
          } else if (props) {
            children = children || vnode.children;
          } else {
            children = children || vnode.children;
          }

          if (props && Object.keys(props).length === 0) props = null;
          children = evaluateAST(children, { parent: vnode }).flat(Infinity);

          if (typeof vnode.type === 'function') return evaluateAST(vnode.type({ ...props, children }));
          if (vnode.type === '') return children;
          return { ...vnode, props, children };
        }
        
        // Do not escape <script> or <style> contents
        if (ctx.parent && ['script', 'style'].includes(ctx.parent.type)) return vnode;

        if (!isFalsey(vnode)) return sanitize(vnode);
      });
    }

    return evaluateAST([built]);
  };

  return evaluateAST(built);
};

const serializeProps = (props) => {
  if (!props) return '';
  let str = '';
  for (let [key, value] of Object.entries(props)) {
    if (isNullish(value) || typeof value === 'function') continue;
    if (typeof value === 'object') value = JSON.stringify(value);
    let quote = typeof value === 'string' && value.indexOf('"') > -1 ? `'` : `"`;
    str += ` ${key}=${quote}${value}${quote}`;
  }
  return str;
};

export const renderToString = (ast) => {
  if (Array.isArray(ast)) {
    return ast
      .map((value) => {
        if (Array.isArray(value)) return renderToString(value);
        if (typeof value === 'object') {
          const { type, props, children } = value;
          if (VOID_ELEMENTS.test(type)) return `<${type}${serializeProps(props)} />`;
          return `<${type}${serializeProps(props)}>${renderToString(children)}</${type}>`;
        }

        return value;
      })
      .join('\n');
  }

  return renderToString([ast]);
};

const ast = (text) => evaluate(parse(text));

export default ast;
